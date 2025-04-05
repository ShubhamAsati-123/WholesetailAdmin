import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { type UserRole, VerificationStatus } from "@prisma/client"
import { uploadImage } from "@/lib/upload"
import { sendEmail } from "@/lib/email"
import { corsHeaders } from "@/lib/cors"

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) })
}

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
      // Document URLs or base64 images
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
      return NextResponse.json({ error: "Email already exists" }, { status: 409, headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Upload images if they are base64 strings
    const uploadedShopImage =
      shopImage && shopImage.startsWith("data:") ? await uploadImage(shopImage, "shop") : shopImage

    const uploadedAadharImage =
      aadharImage && aadharImage.startsWith("data:") ? await uploadImage(aadharImage, "aadhar") : aadharImage

    const uploadedPanImage = panImage && panImage.startsWith("data:") ? await uploadImage(panImage, "pan") : panImage

    const uploadedLicenseImage =
      licenseImage && licenseImage.startsWith("data:") ? await uploadImage(licenseImage, "license") : licenseImage

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
              shopImage: uploadedShopImage,
              aadharImage: uploadedAadharImage,
              panImage: uploadedPanImage,
              licenseImage: uploadedLicenseImage,
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
              companyImage: uploadedShopImage,
              aadharImage: uploadedAadharImage,
              panImage: uploadedPanImage,
              licenseImage: uploadedLicenseImage,
            },
          },
        }),
      },
    })

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Wholesetail - Registration Confirmation",
        template: "verification-pending",
        data: { name },
      })
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Continue with the response even if email fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "User created successfully. Awaiting verification.",
      },
      { status: 201, headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) },
    )
  } catch (error) {
    console.error("SIGNUP_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) })
  }
}

