
import mongoose from "mongoose"
const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.CONNECTION_URL)
        console.log("DB connected")
    } catch (error) {
        next(new Error(error.message))
    }
}

export default connectDB
