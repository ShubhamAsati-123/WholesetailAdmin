import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
  "https://wholesetail-admin.vercel.app",
];

export async function middleware(req: NextRequest) {
  // Get the origin from the request headers
  const origin = req.headers.get("origin") || "";

  // Check if the origin is allowed or if it's a same-origin request
  const isAllowedOrigin = allowedOrigins.includes(origin) || !origin;

  // Get the response
  const response = NextResponse.next();

  // Skip token verification for specific routes that don't need authentication
  const isPublicRoute =
    req.nextUrl.pathname.startsWith("/api/auth/login") ||
    req.nextUrl.pathname.startsWith("/api/auth/signup") ||
    req.nextUrl.pathname.startsWith("/api/auth/register");

  // For debugging
  console.log("Request path:", req.nextUrl.pathname);
  console.log("Is public route:", isPublicRoute);

  // We'll skip token verification in middleware and let the API routes handle it
  // This avoids the Edge Runtime crypto module issue

  // Set CORS headers
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  } else {
    // For security, you might want to restrict to your known domains in production
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  // Set other CORS headers
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
