import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// List of allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:19000", // Expo development server
  "http://localhost:19001",
  "http://localhost:19002",
  "http://localhost:8081",
  "https://wholesetail-admin.vercel.app",
  // Add your production domains here
]

export async function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get("origin") || ""

  // Check if the origin is allowed or if it's a same-origin request
  const isAllowedOrigin = allowedOrigins.includes(origin) || !origin

  // Get the response
  const response = NextResponse.next()

  const token = await getToken({ req: request })

  // Check if the path starts with /api/admin
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin
    if (token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // Set CORS headers
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*")
  } else {
    // For security, you might want to restrict to your known domains in production
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0])
  }

  // Set other CORS headers
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}

