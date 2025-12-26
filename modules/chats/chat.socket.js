import { verifyToken } from "../../utils/security/jwtToken.security.js";
import { sendMessage } from "./chats.service.js";
import { connectedSockets } from "./connected.sockets.js";


//Socket Authentication Middleware
export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const { access_token } = socket.handshake.query;

      if (!access_token) {
        throw new Error("Authentication error access_token must provided");
      }

      const user = verifyToken("ACCESS_TOKEN", access_token);

      if (!user) {
        throw new Error("Authentication error Invalid access_token");
      }

      socket.user = user;

      next();
    } catch (error) {
      next(error);
    }
  });

  // Socket Connection
  io.on("connection", (socket) => {
    if (!connectedSockets.has(socket.user.userId)) {
      connectedSockets.set(socket.user.userId, new Set());
      io.emit("online-user", socket.user.userId);
    }

    connectedSockets.get(socket.user.userId).add(socket.id);

    socket.on("send-message", async (data, callback) => {
     await sendMessage(socket ,io , data, callback);
    });

    // Read Receipt
    socket.on("read-receipt", async ({ chatId }) => {
      try {
        await Message.updateMany(
          { chat: chatId, receiver: socket.userId, isRead: false },
          { isRead: true }
        );

        await Chat.findByIdAndUpdate(chatId, {
          $set: { [`unreadCount.${socket.userId}`]: 0 },
        });
      } catch (error) {
        console.error("read_receipt error:", error.message);
      }
    });

    // Typing Indicator
    socket.on("typing", ({ receiverId }) => {
      io.to(receiverId.toString()).emit("typing", {
        from: socket.userId,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.userId);
    });
  });
};
