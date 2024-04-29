
import express from 'express';
import { LikePostController, createPostController, deletePostController, getAllPostController, getPostController, updatePostController } from '../../Controller/Post/PostController.js';

const postRoutes = express.Router();

postRoutes.get('/getPost/:id',getPostController);
postRoutes.get('/getAllPost',getAllPostController);
postRoutes.delete('/deletePost/:id',deletePostController);
postRoutes.post('/createPost',createPostController);
postRoutes.post('/updatePost',updatePostController);
postRoutes.post('/likePost',LikePostController);


export default postRoutes;