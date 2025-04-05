import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { VerificationStatus } from "@prisma/client"
import { sendEmail } from "@/lib/email"
import { corsHeaders } from "@/lib/cors"

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: corsHeaders(req) })
    }

    if (!Object.values(VerificationStatus).includes(status as VerificationStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400, headers: corsHeaders(req) })
    }

    const user = await db.user.update({
      where: { id },
      data: {
        verificationStatus: status as VerificationStatus,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
      },
    })

    // Send email notification based on verification status
    try {
      if (status === "APPROVED") {
        await sendEmail({
          to: user.email,
          subject: "Your Wholesetail Account Has Been Approved",
          template: "verification-approved",
          data: { name: user.name },
        })
      } else if (status === "REJECTED") {
        await sendEmail({
          to: user.email,
          subject: "Your Wholesetail Account Verification Was Rejected",
          template: "verification-rejected",
          data: { name: user.name },
        })
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      // Continue with the response even if email fails
    }

    return NextResponse.json(
      {
        user,
        message: `User verification status updated to ${status}`,
      },
      { headers: corsHeaders(req) },
    )
  } catch (error) {
    console.error("UPDATE_VERIFICATION_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders(req) })
  }
}

