
import express from 'express';
import userRoutes from "./User/userRoutes.js";
import authRoutes from "./Auth/AuthRoutes.js";
import postRoutes from './Post/Post.js';
import { jwtVerifier } from '../middlewear.js';

const routes = express.Router();

routes.use("/auth",authRoutes);
routes.use("/user",jwtVerifier,userRoutes);
routes.use("/post",jwtVerifier,postRoutes);

export default routes;
