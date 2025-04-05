import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(base64Image: string, folder = "wholesetail") {
  try {
    // Remove data URL prefix if present
    const formattedImage = base64Image.includes("base64") ? base64Image : `data:image/jpeg;base64,${base64Image}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(formattedImage, {
      folder,
    })

    return result.secure_url
  } catch (error) {
    console.error("Image upload error:", error)
    throw new Error("Failed to upload image")
  }
}

