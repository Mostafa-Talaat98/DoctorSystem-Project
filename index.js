import express from 'express'
import bootstrap from './app.controller.js'
import dotenv from 'dotenv'
import authRouter from './modules/auth/auth.routes.js'

dotenv.config()
const app = express()
const port = process.env.PORT
app.use(express.json());

app.use(authRouter)

bootstrap(app, express)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))