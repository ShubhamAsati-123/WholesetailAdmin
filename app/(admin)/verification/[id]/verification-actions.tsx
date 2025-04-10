"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

interface VerificationActionsProps {
  userId: string;
}

export function VerificationActions({ userId }: VerificationActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Get token on component mount
  useEffect(() => {
    // Try to get token from localStorage or sessionStorage
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      console.warn("No authentication token found in storage");
    } else {
      console.log(
        "Token found in storage:",
        storedToken.substring(0, 10) + "..."
      );
    }
  }, []);

  const updateVerificationStatus = async (status: "APPROVED" | "REJECTED") => {
    setIsLoading(status);
    try {
      console.log(`Updating status to ${status} for user ${userId}`);

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Log the request details for debugging
      console.log("Request URL:", `/api/admin/users/${userId}/verify`);
      console.log("Request Method:", "PATCH");
      console.log("Request Headers:", {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.substring(0, 10)}...`,
      });
      console.log("Request Body:", {
        status,
        notes: notes.trim() || undefined,
      });

      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          notes: notes.trim() || undefined,
        }),
      });

      // Log the response status for debugging
      console.log("Response Status:", response.status);

      const responseData = await response.json();
      console.log("Response Data:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `Failed to update verification status: ${response.status}`
        );
      }

      toast({
        title: "Success",
        description: `User has been ${status === "APPROVED" ? "approved" : "rejected"}.`,
      });

      // Redirect back to the verification portal
      router.push("/verification");
      router.refresh();
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {!token && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
          Warning: You are not authenticated. Please log in again to approve or
          reject users.
        </div>
      )}
      <Textarea
        placeholder="Add notes about this verification (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex space-x-2">
        <Button
          onClick={() => updateVerificationStatus("APPROVED")}
          disabled={isLoading !== null || !token}
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
          disabled={isLoading !== null || !token}
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
  );
}
