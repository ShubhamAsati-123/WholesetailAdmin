import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { corsHeaders } from "@/lib/cors"

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) })
}

export async function GET(req: Request) {
  try {
    const [totalUsers, pendingVerifications, approvedVerifications, rejectedVerifications, recentUsers] =
      await Promise.all([
        db.user.count({
          where: { role: { in: ["RETAILER", "WHOLESALER"] } },
        }),
        db.user.count({
          where: {
            role: { in: ["RETAILER", "WHOLESALER"] },
            verificationStatus: "PENDING",
          },
        }),
        db.user.count({
          where: {
            role: { in: ["RETAILER", "WHOLESALER"] },
            verificationStatus: "APPROVED",
          },
        }),
        db.user.count({
          where: {
            role: { in: ["RETAILER", "WHOLESALER"] },
            verificationStatus: "REJECTED",
          },
        }),
        db.user.findMany({
          where: { role: { in: ["RETAILER", "WHOLESALER"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            verificationStatus: true,
            createdAt: true,
          },
        }),
      ])

    return NextResponse.json(
      {
        totalUsers,
        pendingVerifications,
        approvedVerifications,
        rejectedVerifications,
        recentUsers,
      },
      { headers: corsHeaders(req) },
    )
  } catch (error) {
    console.error("GET_STATS_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders(req) })
  }
}

