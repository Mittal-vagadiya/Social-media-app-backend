
import express from 'express';
import { createCommentController, deleteCommentController, updateCommentController } from '../../Controller/Post/CommentsController.js';

const commentRoutes = express.Router();

commentRoutes.post('/createComment',createCommentController);
commentRoutes.delete('/deleteComment/:id',deleteCommentController);
commentRoutes.post('/updateComment',updateCommentController);

export default commentRoutes;