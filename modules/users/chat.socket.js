import jwt from "jsonwebtoken";
import Chat from "./chat.model.js";
import Message from "./message.model.js";

//Socket Authentication Middleware
export const initializeSocket = (io) => {
  io.use(async(socket, next) => {
    try {
      // const token = socket.query.token;
      console.log(socket);
      // if (!token) {
      //   return next(new Error("Authentication error"));
      // }

      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // socket.user = decoded;
      // socket.userId = decoded._id || decoded.id;

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Socket Connection
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.userId);

   
    // Send Message in real-time
    socket.on("send_message", async (data) => {
      try {
        const { receiverId, content, type = "text" } = data;
        if (!receiverId || !content) return;

        const senderId = socket.userId;

        // Doctor ↔ Patient rule
        const isDoctorSender = socket.user.role === "DOCTOR";

        const chatQuery = isDoctorSender
          ? { doctor: senderId, patient: receiverId }
          : { doctor: receiverId, patient: senderId };

        // Find or create chat
        let chat = await Chat.findOne(chatQuery);
        if (!chat) {
          chat = await Chat.create(chatQuery);
        }

        // Save message
        const message = await Message.create({
          chat: chat._id,
          sender: senderId,
          receiver: receiverId,
          content,
          type,
        });

        // Update chat meta
        chat.lastMessage = message._id;
        const unread = chat.unreadCount.get(receiverId.toString()) || 0;
        chat.unreadCount.set(receiverId.toString(), unread + 1);
        await chat.save();

        // Emit message to receiver
        io.to(receiverId.toString()).emit("new_message", {
          chatId: chat._id,
          message,
        });
      } catch (error) {
        console.error("send_message error:", error.message);
      }
    });

    // Read Receipt
    socket.on("read_receipt", async ({ chatId }) => {
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
