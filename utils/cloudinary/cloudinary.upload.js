import { BadRequestException } from "../response/error.response.js";
import cloudinary from "./cloudinary.config.js";
import { deleteFolderFromCloudinary } from "./cloudinary.delete.js";


export async function uploadToCloudinary(file, folder = "Doctor_Appointment") {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result);
      }
    );

    upload.end(file.buffer);
  });
}

export async function uploadMultiImagesToCloudinary(files = [], path) {
  const images = [];

  await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(file, path);

      if (!result) {
        await deleteFolderFromCloudinary(path);
        return false;
      }

      images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    })
  );

  if (!images.length) {
    throw new BadRequestException("Fail To Upload Images");
  }

  return images;
}