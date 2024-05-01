
import express from 'express';
import userRoutes from "./User/userRoutes.js";
import authRoutes from "./Auth/AuthRoutes.js";
import { jwtVerifier } from '../middlewear.js';
import collectionRoutes from './Collection/CollectionRoutes.js';
import postRoutes from './Post/PostRoutes.js';
import commentRoutes from './Post/commentRoutes.js';

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/user", jwtVerifier, userRoutes);
routes.use("/post", jwtVerifier, postRoutes);
routes.use("/comment", jwtVerifier, commentRoutes);
routes.use('/collection', jwtVerifier, collectionRoutes)

export default routes;
