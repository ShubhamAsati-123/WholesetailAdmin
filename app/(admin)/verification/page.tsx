import { Suspense } from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import { VerificationFilters } from "./verification-filters"

// Mark this as a server component with dynamic rendering
export const dynamic = "force-dynamic"

async function getPendingVerifications() {
  const users = await db.user.findMany({
    where: {
      role: { in: ["RETAILER", "WHOLESALER"] },
      verificationStatus: "PENDING",
    },
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

export default function VerificationPortalPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Verification Portal</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Review and verify retailer and wholesaler accounts</CardDescription>
            </div>
            <VerificationFilters />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading pending verifications...</div>}>
            <PendingVerificationsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function PendingVerificationsList() {
  const users = await getPendingVerifications()

  return (
    <div>
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-green-100 p-3 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
          <p className="mt-2 text-sm text-muted-foreground">There are no pending verifications at the moment.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  {user.role === "RETAILER" ? user.retailerProfile?.shopName : user.wholesalerProfile?.companyName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="default">
                    <Link href={`/verification/${user.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

