"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthDebug() {
  const [authStatus, setAuthStatus] = useState<{
    authenticated: boolean;
    user?: any;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from storage
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      if (!token) {
        setAuthStatus({
          authenticated: false,
          error: "No token found in storage",
        });
        return;
      }

      const response = await fetch("/api/auth/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      setAuthStatus({
        authenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setAuthStatus(null);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
        <CardDescription>Check your authentication status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Token Status:</p>
            <p className="text-sm text-muted-foreground">
              {token
                ? `Token found: ${token.substring(0, 15)}...`
                : "No token found in storage"}
            </p>
          </div>

          {authStatus && (
            <div className="mt-4 p-4 rounded-md border">
              <p className="font-medium">
                Status:{" "}
                {authStatus.authenticated
                  ? "Authenticated ✅"
                  : "Not Authenticated ❌"}
              </p>
              {authStatus.user && (
                <div className="mt-2">
                  <p className="text-sm">User: {authStatus.user.name}</p>
                  <p className="text-sm">Email: {authStatus.user.email}</p>
                  <p className="text-sm">Role: {authStatus.user.role}</p>
                </div>
              )}
              {authStatus.error && (
                <p className="text-sm text-red-500 mt-2">
                  Error: {authStatus.error}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={checkAuth} disabled={loading}>
          {loading ? "Checking..." : "Check Auth Status"}
        </Button>
        <Button variant="outline" onClick={clearToken}>
          Clear Token
        </Button>
      </CardFooter>
    </Card>
  );
}
