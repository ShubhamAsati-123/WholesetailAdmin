import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VerificationStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { corsHeaders } from "@/lib/cors";
import { verify as verifyJwt } from "jsonwebtoken";

// Helper function to verify JWT token
async function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(
      "Invalid auth header format:",
      authHeader ? "Present but invalid format" : "Missing"
    );
    return null;
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted from header:", token.substring(0, 10) + "...");

  try {
    // Verify the token
    const decoded = verifyJwt(token, process.env.JWT_SECRET!);
    console.log("Token verified successfully, decoded payload:", decoded);
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("PATCH request received for user ID:", params.id);

  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header:", authHeader ? "Present" : "Missing");

    // Skip token verification in development for testing if needed
    // For production, always verify the token
    const isDevMode = process.env.NODE_ENV === "development";
    const skipAuth = isDevMode; // Set to true for development testing

    if (!skipAuth) {
      const decoded = await verifyToken(authHeader);

      if (!decoded) {
        console.log("Token verification failed");
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401, headers: corsHeaders(req) }
        );
      }

      // Check if user is admin
      if ((decoded as any).role !== "ADMIN") {
        console.log("User is not an admin:", (decoded as any).role);
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403, headers: corsHeaders(req) }
        );
      }

      console.log(
        "Authentication successful for admin user:",
        (decoded as any).email
      );
    } else {
      console.log("⚠️ WARNING: Skipping authentication in development mode");
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    const body = await req.json();
    const { status, notes } = body;

    console.log(`Updating user ${id} to status: ${status}`);

    if (
      !Object.values(VerificationStatus).includes(status as VerificationStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    // Update the user's verification status
    const user = await db.user.update({
      where: { id },
      data: {
        verificationStatus: status as VerificationStatus,
        ...(notes && { verificationNotes: notes }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
      },
    });

    console.log(`User updated successfully: ${JSON.stringify(user)}`);

    // Send email notification based on verification status
    try {
      if (status === "APPROVED") {
        console.log(`Sending approval email to ${user.email}`);
        await sendEmail({
          to: user.email,
          subject: "Your Wholesetail Account Has Been Approved",
          template: "verification-approved",
          data: { name: user.name },
        });
      } else if (status === "REJECTED") {
        console.log(`Sending rejection email to ${user.email}`);
        await sendEmail({
          to: user.email,
          subject: "Your Wholesetail Account Verification Was Rejected",
          template: "verification-rejected",
          data: {
            name: user.name,
            notes: notes || undefined,
          },
        });
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Continue with the response even if email fails
    }

    return NextResponse.json(
      {
        user,
        message: `User verification status updated to ${status}`,
      },
      { headers: corsHeaders(req) }
    );
  } catch (error) {
    console.error("UPDATE_VERIFICATION_ERROR", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
