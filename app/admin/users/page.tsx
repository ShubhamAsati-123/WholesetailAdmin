import { Suspense } from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"

async function getUsers() {
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

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all registered retailers and wholesalers</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading users...</div>}>
            <UsersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function UsersList() {
  const users = await getUsers()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Business</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registered</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
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
              <TableCell>
                <Badge
                  className={
                    user.verificationStatus === "APPROVED"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : user.verificationStatus === "REJECTED"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }
                >
                  {user.verificationStatus.toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/admin/users/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

