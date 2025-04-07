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

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: corsHeaders(req) })
    }

    const body = await req.json()
    const { status, notes } = body

    console.log(`Updating user ${id} to status: ${status}`)

    if (!Object.values(VerificationStatus).includes(status as VerificationStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400, headers: corsHeaders(req) })
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
    })

    console.log(`User updated successfully: ${JSON.stringify(user)}`)

    // Send email notification based on verification status
    try {
      if (status === "APPROVED") {
        console.log(`Sending approval email to ${user.email}`)
        await sendEmail({
          to: user.email,
          subject: "Your Wholesetail Account Has Been Approved",
          template: "verification-approved",
          data: { name: user.name },
        })
      } else if (status === "REJECTED") {
        console.log(`Sending rejection email to ${user.email}`)
        await sendEmail({
          to: user.email,
          subject: "Your Wholesetail Account Verification Was Rejected",
          template: "verification-rejected",
          data: {
            name: user.name,
            notes: notes || undefined,
          },
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
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders(req) },
    )
  }
}

