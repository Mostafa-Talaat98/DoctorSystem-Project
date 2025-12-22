import express from "express";
import bootstrap from "./app.controller.js";
import connectDB from "./DB/connect.js";
import doctorRoutes from "./modules/Doctor/Get Doctors Feature/Routes/getDoctorsRoutes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;



import favRoutes from "./modules/Doctor/favourite Feature/Routes/doctorRoutes.js";

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/favorite", favRoutes);

bootstrap(app, express);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
