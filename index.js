import dotenv from "dotenv";
import express from "express";
import bootstrap from "./app.controller.js";
import connectDB from "./DB/connect.js";

// import doctorRoutes from "./modules/Doctor/Get Doctors Feature/Routes/getDoctorsRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

bootstrap(app, express);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
