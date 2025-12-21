import { ApplicationException, BadRequestException } from "../response/error.response.js";
import cloudinary from "./cloudinary.config.js";


export const deleteImageFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting image: ${publicId}`, error);
    throw error;
  }
};


export async function deleteMultiFromCloudinary(publicIds = []) {
  try {
    if (!publicIds.length) return false;

    const results = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId);

          if (result?.result === "not found") {
            throw new BadRequestException("Image not found");
          }

          return true;
        } catch (error) {
          console.error(`❌ Failed to delete ${publicId}:`, error.message);
          throw error;
        }
      })
    );

    return results.every((r) => r === true);
  } catch (error) {
    console.error("Error deleting multiple files from Cloudinary:", error);
    throw new ApplicationException(
      "Error deleting multiple files from Cloudinary"
    );
  }
}


export async function deleteFolderFromCloudinary(folderPath) {
  try {

    await cloudinary.api.delete_resources_by_prefix(folderPath);


    const { folders } = await cloudinary.api.sub_folders(folderPath);


    for (const sub of folders) {
      await deleteFolderFromCloudinary(sub.path);
    }


    await cloudinary.api.delete_folder(folderPath).catch(() => {

    });
  } catch (error) {
    if (error?.error?.http_code === 404) {
      console.warn(`⚠️ Folder not found: ${folderPath}`);
      return;
    }

    throw new ApplicationException(
      `Error deleting folder "${folderPath}": ${error.message || error}`
    );
  }
}
