import mongoose, { Schema, model } from 'mongoose';
import sharedData from './sharedSchema.js';

const PatientSchema = new Schema({
    ...sharedData,
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    }]
}, { timestamps: true });
export default model('Patient', PatientSchema);
