import express from "express";
import { getAllDoctors, getDoctorById, getDoctorBySpecialty, getDoctorByName } from "../Controllers/getDoctorsController.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.get("/specialty", getDoctorBySpecialty);
router.get("/name", getDoctorByName);
router.get("/:id", getDoctorById);

export default router;
