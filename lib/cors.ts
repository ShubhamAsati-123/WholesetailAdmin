import { type NextRequest, NextResponse } from "next/server"

// List of allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:19000", // Expo development server
  "http://localhost:19001",
  "http://localhost:19002",
  "http://localhost:8081",
  "https://wholesetail-admin.vercel.app",
  // Add your production domains and mobile app URIs here
]

export function corsHeaders(req: NextRequest | { headers: { origin?: string } }) {
  const origin = req.headers instanceof Headers ? req.headers.get("origin") || "" : req.headers.origin || ""
  const isAllowedOrigin = allowedOrigins.includes(origin) || !origin

  const headers = new Headers()

  if (isAllowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin || "*")
  } else {
    // For security, you might want to restrict to your known domains in production
    headers.set("Access-Control-Allow-Origin", allowedOrigins[0])
  }

  headers.set("Access-Control-Allow-Credentials", "true")
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
  headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  return headers
}

// Helper for handling OPTIONS requests in API routes
export function handleCors(req: NextRequest, res: NextResponse) {
  const headers = corsHeaders(req)

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers,
    })
  }

  // For other methods, just return the headers
  return headers
}

