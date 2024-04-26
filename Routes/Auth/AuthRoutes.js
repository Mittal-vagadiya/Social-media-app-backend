import express from "express";
import { LoginController, RegisterController, ResetPasswordController } from "../../Controller/Auth/AuthController.js";

const authRoutes = express.Router();
authRoutes.post('/login',LoginController)
authRoutes.post('/register',RegisterController)
authRoutes.post('/resetPassword',ResetPasswordController)


export default authRoutes;