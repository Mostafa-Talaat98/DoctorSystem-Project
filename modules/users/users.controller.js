import { Router } from "express";
import * as usersService  from "./users.service.js";
import { cloudFileUpload, fileValidation } from "../../utils/multer/cloud.multer.js";

const usersRouter = Router();

usersRouter.patch("/upload-profile-picture",cloudFileUpload({
    validation: fileValidation.image,
  }).single("image"), usersService.uploadProfilePicture);

export default usersRouter;
