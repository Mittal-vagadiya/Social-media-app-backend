
import express from 'express';
import { createCommentController, deleteCommentController, deletereplyCommentController, filterCommentController, replyCommentController, updateCommentController, updatereplyCommentController } from '../../Controller/Post/CommentsController.js';

const commentRoutes = express.Router();

commentRoutes.post('/createComment', createCommentController);
commentRoutes.delete('/deleteComment/:id', deleteCommentController);
commentRoutes.post('/updateComment', updateCommentController);

commentRoutes.post('/replyComment', replyCommentController);
commentRoutes.delete('/deleteReply/:id', deletereplyCommentController);
commentRoutes.post('/updateReply', updatereplyCommentController);
commentRoutes.get('/filterComments', filterCommentController);


export default commentRoutes;