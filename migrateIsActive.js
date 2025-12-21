import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './DB/models/DoctorSchema.js';

dotenv.config();

const migrateIsActive = async () => {
    try {
        if (!process.env.DB_CONNECTION) {
            throw new Error("DB_CONNECTION not found in .env");
        }
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log("Connected to DB...");

        // Update all doctors that don't have 'isActive' field
        const result = await Doctor.updateMany(
            { isActive: { $exists: false } }, 
            { $set: { isActive: true } }
        );

        console.log(`Migration complete. Added isActive: true to ${result.modifiedCount} doctors.`);
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

migrateIsActive();
