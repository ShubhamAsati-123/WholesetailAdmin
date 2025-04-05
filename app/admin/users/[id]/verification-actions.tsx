"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

interface VerificationActionsProps {
  userId: string
}

export function VerificationActions({ userId }: VerificationActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const updateVerificationStatus = async (status: "APPROVED" | "REJECTED") => {
    setIsLoading(status)
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update verification status")
      }

      toast({
        title: "Success",
        description: `User has been ${status === "APPROVED" ? "approved" : "rejected"}.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating verification status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update verification status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => updateVerificationStatus("APPROVED")}
        disabled={isLoading !== null}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Approve
      </Button>
      <Button onClick={() => updateVerificationStatus("REJECTED")} disabled={isLoading !== null} variant="destructive">
        <XCircle className="mr-2 h-4 w-4" />
        Reject
      </Button>
    </div>
  )
}

