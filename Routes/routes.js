
import express from 'express';
import userRoutes from "./User/userRoutes.js";
import authRoutes from "./Auth/AuthRoutes.js";
import { jwtVerifier } from '../middlewear.js';
import postRoutes from './Post/Postroutes.js';
import commentRoutes from './Post/commentroutes.js';

const routes = express.Router();

routes.use("/auth",authRoutes);
routes.use("/user",jwtVerifier,userRoutes);
routes.use("/post",jwtVerifier,postRoutes);
routes.use("/comment",jwtVerifier,commentRoutes);

export default routes;
