import { NextResponse } from "next/server";
import { verify as verifyJwt } from "jsonwebtoken";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}

export async function GET(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");

    // Log for debugging
    console.log(
      "Auth check - Authorization header:",
      authHeader ? "Present" : "Missing"
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { authenticated: false, error: "No token provided" },
        { status: 401, headers: corsHeaders(req) }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify the token
      const decoded = verifyJwt(token, process.env.JWT_SECRET!);

      // Return the decoded token payload
      return NextResponse.json(
        {
          authenticated: true,
          user: decoded,
        },
        { headers: corsHeaders(req) }
      );
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        { authenticated: false, error: "Invalid token" },
        { status: 401, headers: corsHeaders(req) }
      );
    }
  } catch (error) {
    console.error("AUTH_CHECK_ERROR", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
