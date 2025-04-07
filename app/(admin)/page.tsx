import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRound, ShieldCheck, AlertTriangle, Clock } from "lucide-react"
import { db } from "@/lib/db"

// Mark this as a server component with dynamic rendering
export const dynamic = "force-dynamic"

async function getDashboardData() {
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

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<div>Loading stats...</div>}>
            <DashboardStats />
          </Suspense>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>The latest users who have signed up for verification</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading recent users...</div>}>
                  <RecentUsers />
                </Suspense>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>Distribution of verification statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading verification stats...</div>}>
                  <VerificationChart />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-7">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>User registration and verification trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Analytics data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function DashboardStats() {
  const { totalUsers, pendingVerifications, approvedVerifications, rejectedVerifications } = await getDashboardData()

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <UserRound className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">Retailers and wholesalers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingVerifications}</div>
          <p className="text-xs text-muted-foreground">Awaiting verification</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvedVerifications}</div>
          <p className="text-xs text-muted-foreground">Verified accounts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rejectedVerifications}</div>
          <p className="text-xs text-muted-foreground">Failed verification</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function RecentUsers() {
  const { recentUsers } = await getDashboardData()

  return (
    <div className="space-y-8">
      {recentUsers.length === 0 ? (
        <p className="text-center text-muted-foreground">No users yet</p>
      ) : (
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs capitalize">{user.role.toLowerCase()}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    user.verificationStatus === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : user.verificationStatus === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.verificationStatus.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function VerificationChart() {
  const { pendingVerifications, approvedVerifications, rejectedVerifications } = await getDashboardData()

  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="text-center">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{pendingVerifications}</div>
            <div className="h-2 w-full rounded bg-yellow-400"></div>
            <p className="mt-2 text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{approvedVerifications}</div>
            <div className="h-2 w-full rounded bg-green-500"></div>
            <p className="mt-2 text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{rejectedVerifications}</div>
            <div className="h-2 w-full rounded bg-red-500"></div>
            <p className="mt-2 text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  )
}

