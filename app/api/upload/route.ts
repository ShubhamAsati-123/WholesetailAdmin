import { NextResponse } from "next/server"
import { uploadImage } from "@/lib/upload"
import { corsHeaders } from "@/lib/cors"

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) })
}

export async function POST(req: Request) {
  try {
    const { image, folder } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400, headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) })
    }

    const imageUrl = await uploadImage(image, folder)

    return NextResponse.json(
      { url: imageUrl },
      { headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) }
    )
  } catch (error) {
    console.error("UPLOAD_ERROR", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500, headers: corsHeaders({ headers: { origin: req.headers.get("origin") || undefined } }) })
  }
}

