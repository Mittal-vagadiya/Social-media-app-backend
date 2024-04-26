
import express from 'express';
import { createPostController, deletePostController, getAllPostController, getPostController, updatePostController } from '../../Controller/Post/PostController.js';

const postRoutes = express.Router();

postRoutes.get('/getPost/:id',getPostController);
postRoutes.get('/getAllPost',getAllPostController);
postRoutes.delete('/deletePost/:id',deletePostController);
postRoutes.post('/createPost',createPostController);
postRoutes.post('/updatePost',updatePostController)

export default postRoutes;