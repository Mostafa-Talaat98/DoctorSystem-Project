import multer from "multer";
import os from "node:os";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../response/error.response.js";


export const fileValidation = {
  image: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],
};


export const cloudFileUpload = ({
  storageApproach = "memory",
  validation = [],
  maxFileSizeMB = 6,
} = {}) => {
  const storage = multer.memoryStorage();

  function fileFilter(req, file, callback) {
    if (!validation.includes(file.mimetype)) {
      return callback(
        new BadRequestException("ValidationError", {
          validationErrors: [
            {
              key: "file",
              issues: [
                {
                  path: "file",
                  message: "Invalid File Format",
                  info: "Only Accept Valid Formats",
                  validFormats: validation,
                },
              ],
            },
          ],
        })
      );
    }

    callback(null, true);
  }

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
    },
  });
};
