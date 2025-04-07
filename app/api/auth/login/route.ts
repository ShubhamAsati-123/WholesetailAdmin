import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { sign } from "jsonwebtoken"
import { db } from "@/lib/db"
import { corsHeaders } from "@/lib/cors"

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) })
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400, headers: corsHeaders(req) })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        verificationStatus: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders(req) })
    }

    // Check if user is verified
    if (user.verificationStatus !== "APPROVED" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Account not verified",
          verificationStatus: user.verificationStatus,
        },
        { status: 403, headers: corsHeaders(req) },
      )
    }

    // Verify password
    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders(req) })
    }

    // Generate JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
      },
      { headers: corsHeaders(req) },
    )
  } catch (error) {
    console.error("LOGIN_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders(req) })
  }
}

