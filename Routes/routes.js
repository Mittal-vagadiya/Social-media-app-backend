
import express from 'express';
import userRoutes from "./User/userRoutes.js";
import authRoutes from "./Auth/authRoutes.js";
import { jwtVerifier } from '../middlewear.js';
import collectionRoutes from './Collection/collectionRoutes.js';
import postRoutes from './Post/postRoutes.js';
import commentRoutes from './Post/commentRoutes.js';
import archiverRoutes from './Post/archiveRoutes.js';
import favouritesRoutes from './Post/favouritesRoutes.js';
import storyRoutes from './Story/StoryRoutes.js';

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/user", jwtVerifier, userRoutes);
routes.use("/post", jwtVerifier, postRoutes);
routes.use("/comment", jwtVerifier, commentRoutes);
routes.use('/collection', jwtVerifier, collectionRoutes)
routes.use('/archive', jwtVerifier, archiverRoutes)
routes.use('/favourites', jwtVerifier, favouritesRoutes)
routes.use('/story', jwtVerifier, storyRoutes)

export default routes;
