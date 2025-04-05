import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { VerificationActions } from "./verification-actions"

async function getUser(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        retailerProfile: true,
        wholesalerProfile: true,
      },
    })

    if (!user) return null
    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const profile = user.role === "RETAILER" ? user.retailerProfile : user.wholesalerProfile
  const businessName = user.role === "RETAILER" ? user.retailerProfile?.shopName : user.wholesalerProfile?.companyName
  const businessAddress =
    user.role === "RETAILER" ? user.retailerProfile?.shopAddress : user.wholesalerProfile?.companyAddress

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Personal Information</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Mobile Number</dt>
                    <dd>{user.mobileNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="capitalize">{user.role.toLowerCase()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Registered On</dt>
                    <dd>{format(new Date(user.createdAt), "PPP")}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium">Business Information</h3>
                <Separator className="my-2" />
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Business Name</dt>
                    <dd>{businessName}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Business Address</dt>
                    <dd>{businessAddress}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">GST Number</dt>
                    <dd>{profile?.gstNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">License Number</dt>
                    <dd>{profile?.licenseNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Aadhar Card Number</dt>
                    <dd>{profile?.aadharCardNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">PAN Card Number</dt>
                    <dd>{profile?.panCardNumber}</dd>
                  </div>
                  {user.role === "RETAILER" && user.retailerProfile?.referralCode && (
                    <div>
                      <dt className="text-muted-foreground">Referral Code</dt>
                      <dd>{user.retailerProfile.referralCode}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {user.verificationStatus === "PENDING" && (
                <div>
                  <h3 className="text-sm font-medium">Verification Actions</h3>
                  <Separator className="my-2" />
                  <VerificationActions userId={user.id} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>Review the uploaded documents for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {user.role === "RETAILER" ? "Shop Image" : "Company Image"}
                </h3>
                {profile?.shopImage || profile?.companyImage ? (
                  <div className="relative aspect-video overflow-hidden rounded-md">
                    <Image
                      src={profile.shopImage || profile.companyImage || ""}
                      alt="Business"
                      fill
                      className="object-cover"
                    />
                    <Button asChild size="sm" variant="secondary" className="absolute bottom-2 right-2">
                      <a
                        href={profile.shopImage || profile.companyImage || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Size
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No image uploaded</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Aadhar Card</h3>
                  {profile?.aadharImage ? (
                    <div className="relative aspect-video overflow-hidden rounded-md">
                      <Image
                        src={profile.aadharImage || "/placeholder.svg"}
                        alt="Aadhar Card"
                        fill
                        className="object-cover"
                      />
                      <Button asChild size="sm" variant="secondary" className="absolute bottom-2 right-2">
                        <a href={profile.aadharImage} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No image uploaded</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">PAN Card</h3>
                  {profile?.panImage ? (
                    <div className="relative aspect-video overflow-hidden rounded-md">
                      <Image
                        src={profile.panImage || "/placeholder.svg"}
                        alt="PAN Card"
                        fill
                        className="object-cover"
                      />
                      <Button asChild size="sm" variant="secondary" className="absolute bottom-2 right-2">
                        <a href={profile.panImage} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No image uploaded</p>
                  )}
                </div>

                <div className="col-span-2">
                  <h3 className="text-sm font-medium mb-2">License</h3>
                  {profile?.licenseImage ? (
                    <div className="relative aspect-video overflow-hidden rounded-md">
                      <Image
                        src={profile.licenseImage || "/placeholder.svg"}
                        alt="License"
                        fill
                        className="object-cover"
                      />
                      <Button asChild size="sm" variant="secondary" className="absolute bottom-2 right-2">
                        <a href={profile.licenseImage} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Full Size
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No image uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

