import { Router } from "express";
import * as usersService from "./users.service.js";
import { getAllDoctors, getDoctorBySpecialty, getDoctorById, getDoctorByName } from "./users.service.js";
import { cloudFileUpload, fileValidation } from "../../utils/multer/cloud.multer.js";

import { authenticateUser } from "../middleware/authenticateUser.middleware.js";


const usersRouter = Router();

usersRouter.patch("/upload-profile-picture", cloudFileUpload({
  validation: fileValidation.image,
}).single("image"), usersService.uploadProfilePicture);



usersRouter.patch("/:id/like", usersService.toggleLike);

// Doctor Routes
usersRouter.get("/doctors", getAllDoctors);
usersRouter.get("/doctors/specialty", getDoctorBySpecialty);
usersRouter.get("/doctors/name", getDoctorByName);
usersRouter.get("/doctor/:id", getDoctorById);

// Chat Routes
usersRouter.get("/chats", authenticateUser(), usersService.getChats);
usersRouter.get("/chats/:chatUser", authenticateUser(), usersService.getMessages);
// usersRouter.patch("/chats/:chatId/read", authenticateUser(), usersService.markAsRead);
// usersRouter.patch("/chats/:chatId/favorite", authenticateUser(), usersService.toggleFavorite);

export default usersRouter;