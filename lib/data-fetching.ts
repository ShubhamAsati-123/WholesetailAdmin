import { db } from "@/lib/db"

export async function getDashboardData() {
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

  return {
    totalUsers,
    pendingVerifications,
    approvedVerifications,
    rejectedVerifications,
    recentUsers,
  }
}

export async function getUsers() {
  const users = await db.user.findMany({
    where: { role: { in: ["RETAILER", "WHOLESALER"] } },
    orderBy: { createdAt: "desc" },
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
        },
      },
      wholesalerProfile: {
        select: {
          companyName: true,
        },
      },
    },
  })

  return users
}

