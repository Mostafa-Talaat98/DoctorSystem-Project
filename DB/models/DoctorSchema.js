import mongoose, { Schema, model } from 'mongoose';
import sharedData from './sharedSchema.js';

const DoctorSchema = new Schema({
    ...sharedData,
    specialty: {
        type: String,
        trim: true,
    },

    licenseNumber: {
        type: String,
        unique: true,
        trim: true,
    },

    clinicLocation: {
        latitude: {
            type: Number,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180,
        },
    },

    sessionPrice: {
        type: Number,
        min: 0,
    },

    availabilitySlots: {
        type: [Date],
    },

    temporaryPassword: {
        type: String,
        select: false,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Patient'
    }]
}, {
    timestamps: true,
});
const doctorSchema = mongoose.models.Doctor || model('Doctor', DoctorSchema);




export default doctorSchema;