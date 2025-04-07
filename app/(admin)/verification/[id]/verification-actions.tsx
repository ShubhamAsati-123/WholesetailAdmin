"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

interface VerificationActionsProps {
  userId: string
}

export function VerificationActions({ userId }: VerificationActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState("")

  const updateVerificationStatus = async (status: "APPROVED" | "REJECTED") => {
    setIsLoading(status)
    try {
      console.log(`Updating status to ${status} for user ${userId}`)

      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update verification status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: `User has been ${status === "APPROVED" ? "approved" : "rejected"}.`,
      })

      // Redirect back to the verification portal with the updated route
      router.push("/verification")
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
    <div className="space-y-4">
      <Textarea
        placeholder="Add notes about this verification (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex space-x-2">
        <Button
          onClick={() => updateVerificationStatus("APPROVED")}
          disabled={isLoading !== null}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
        >
          {isLoading === "APPROVED" ? (
            "Processing..."
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </>
          )}
        </Button>
        <Button
          onClick={() => updateVerificationStatus("REJECTED")}
          disabled={isLoading !== null}
          variant="destructive"
          className="flex-1"
        >
          {isLoading === "REJECTED" ? (
            "Processing..."
          ) : (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

