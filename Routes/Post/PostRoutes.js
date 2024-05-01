
import express from 'express';
import { LikePostController, createPostController, deletePostController, filterPostController, getAllPostController, getPostController, getUserPostController, updatePostController } from '../../Controller/Post/PostController.js';
import { archivePost } from '../../Controller/Post/ArchiveController.js';

const postRoutes = express.Router();

postRoutes.get('/getPost', getPostController);
postRoutes.get('/getAllPost', getAllPostController);
postRoutes.delete('/deletePost/:id', deletePostController);
postRoutes.post('/createPost', createPostController);
postRoutes.post('/updatePost', updatePostController);
postRoutes.post('/likePost', LikePostController);
postRoutes.get("/getUserPosts", getUserPostController);
postRoutes.get("/filterPost", filterPostController);

postRoutes.post("/archivePost", archivePost);


export default postRoutes;