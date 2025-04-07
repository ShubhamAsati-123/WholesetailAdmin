import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { type UserRole, VerificationStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      password,
      mobileNumber,
      role = "RETAILER",
      // Retailer specific fields
      shopName,
      shopAddress,
      gstNumber,
      licenseNumber,
      aadharCardNumber,
      panCardNumber,
      referralCode,
      // Document URLs
      shopImage,
      aadharImage,
      panImage,
      licenseImage,
    } = body

    // Check if email exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user with appropriate profile based on role
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobileNumber,
        role: role as UserRole,
        verificationStatus: VerificationStatus.PENDING,
        ...(role === "RETAILER" && {
          retailerProfile: {
            create: {
              shopName,
              shopAddress,
              gstNumber,
              licenseNumber,
              aadharCardNumber,
              panCardNumber,
              referralCode,
              shopImage,
              aadharImage,
              panImage,
              licenseImage,
            },
          },
        }),
        ...(role === "WHOLESALER" && {
          wholesalerProfile: {
            create: {
              companyName: shopName,
              companyAddress: shopAddress,
              gstNumber,
              licenseNumber,
              aadharCardNumber,
              panCardNumber,
              companyImage: shopImage,
              aadharImage,
              panImage,
              licenseImage,
            },
          },
        }),
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "User created successfully. Awaiting verification.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("REGISTRATION_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

