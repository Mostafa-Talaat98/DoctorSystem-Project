import { Router } from "express";
import { chatRestService } from "./chats.service.js";
const chatRouter = Router();

chatRouter.get("/my-chats", chatRestService.getChats);
chatRouter.get("/:userId", chatRestService.getMessages);


// chatRouter.patch("/chats/:chatId/read", usersService.markAsRead);
// chatRouter.patch("/chats/:chatId/favorite", usersService.toggleFavorite);

export default chatRouter;