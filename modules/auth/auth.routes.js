import { Router } from "express";

const authRouter = Router();
// > auth/register
// function ====> validate as middleleware
// comapre betwwen schema and the data from body
authRouter.post("/register",(req, res) => {});



export default authRouter