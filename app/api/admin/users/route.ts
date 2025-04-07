import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { corsHeaders } from "@/lib/cors"

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) })
}

export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const role = url.searchParams.get("role")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause based on filters
    const where: any = {}

    if (status) {
      where.verificationStatus = status
    }

    if (role) {
      where.role = role
    }

    // Get users with count
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          mobileNumber: true,
          role: true,
          verificationStatus: true,
          createdAt: true,
          retailerProfile: {
            select: {
              shopName: true,
              shopAddress: true,
              gstNumber: true,
            },
          },
          wholesalerProfile: {
            select: {
              companyName: true,
              companyAddress: true,
              gstNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json(
      {
        users,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      { headers: corsHeaders(req) },
    )
  } catch (error) {
    console.error("GET_USERS_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders(req) })
  }
}

