import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
if (!cloudinaryApiSecret) {
  console.error("CLOUDINARY_API_SECRET is required");
  process.exit(1);
}

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
if (!cloudinaryCloudName) {
  console.error("CLOUDINARY_CLOUD_NAME is required");
  process.exit(1);
}

if (!cloudinaryApiKey) {
  console.error("CLOUDINARY_API_KEY is required");
  process.exit(1);
}

export const config = {
  cloudName: cloudinaryCloudName,
  apiKey: cloudinaryApiKey,
  apiSecret: cloudinaryApiSecret,
};

export const client = cloudinary;
client.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});
