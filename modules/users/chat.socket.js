import { verifyToken } from "../../utils/security/jwtToken.security.js";
import DoctorModel from "../../DB/models/DoctorSchema.js";
import PatientModel from "../../DB/models/patientSchema.js";
import { Types } from "mongoose";
import { ChatModel } from "./chat.model.js";

const connectedSockets = new Map();

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

    socket.on("send_message", async (data, callback) => {
      try {
        const { receiverId, content, type } = data;
        const senderId = socket.user.userId;



        console.log({receiverId , senderId});


        if (receiverId.toString() === senderId.toString()) {
          callback("محدش يكلم نفسه هنا يا ابن الهبلة");
        }

        if (!Types.ObjectId.isValid(receiverId)) {
          callback("ReceiverId Is Not ObjectId يا ابن الجزمة");
        }

        if (!receiverId || !content || !type) {
          callback("Message Must Be Provided [receiverId, content, type]");
        }

        const [isDoctorSender, isPatientSender] = await Promise.all([
          DoctorModel.findById(senderId),
          PatientModel.findById(senderId),
        ]);

        const [isDoctorReceiver, isPatientReceiver] = await Promise.all([
          DoctorModel.findById(receiverId),
          PatientModel.findById(receiverId),
        ]);

        if (!isDoctorReceiver && !isPatientReceiver) {
          callback("ReceiverId Not Found يا ابن الجزمة");
        }

        if (isDoctorSender && isDoctorReceiver) {
          callback("الدكاترة معيكلموش بعضيهم يا ابن الجزمة");
        }

        if (isPatientSender && isPatientReceiver) {
          callback("المرضى ولاد المرضى معيكلموش بعضيهم يا ابن الجزمة");
        }

        // Find or create chat
        let chat = await ChatModel.findOne({
          participants: {
            $all: [
              new Types.ObjectId(senderId.toString()),
              new Types.ObjectId(receiverId.toString()),
            ],
          },
        });

        if (!chat) {
          chat = await ChatModel.create({
            participants: [
              new Types.ObjectId(senderId.toString()),
              new Types.ObjectId(receiverId.toString()),
            ],
          });
        }

        const message = {
          content,
          createdBy: senderId,
        };

        chat.messages.push(message);

        await chat.save();

        const senderSockets = connectedSockets.get(senderId.toString());
        const receiverSockets = connectedSockets.get(receiverId.toString());

        if (senderSockets && senderSockets.size > 0) {
          io.to([...senderSockets]).emit("success-message", {
            content: message.content,
          });
        }

        if (receiverSockets && receiverSockets.size > 0) {
          io.to([...receiverSockets]).emit("new-message", {
            content: message.content,
            from: senderId,
          });
        }


        callback("Message sent Success");

      } catch (error) {
        callback(error);
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
