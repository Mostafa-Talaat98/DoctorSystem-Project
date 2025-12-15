import connectDB from "./DB/connect.js"
import authRouter from "./modules/auth/auth.routes.js"


const bootstrap = async (app, express) => {
    app.use(express.json())

    await connectDB()

    app.use("/auth", authRouter)

    app.use((req, res) => {
        res.status(404).json({ message: "not found" })
    })
    app.use((error, req, res, next) => {
        const status = error.cause;
        res.status(500).json({ message: error.message, stack: error.stack })
    })
}


export default bootstrap