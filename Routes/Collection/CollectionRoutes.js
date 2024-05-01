
import express from 'express';
import { AddPostToCollectionController, createCollectionController, getUserCollectionsController, removePostToCollectionController, updateUserCollectionController } from '../../Controller/Collections/CommentsController.js';

const collectionRoutes = express.Router();

collectionRoutes.post('/createCollection', createCollectionController);
collectionRoutes.get('/getUserCollections', getUserCollectionsController);
collectionRoutes.post('/updateCollection', updateUserCollectionController);
collectionRoutes.post('/addPostToCollection', AddPostToCollectionController);
collectionRoutes.post('/removePostFromCollection', removePostToCollectionController);
// collectionRoutes.post('/likePost', LikePostController);
// collectionRoutes.get("/getUserPosts", getUserPostController);
// collectionRoutes.get("/filterPost", filterPostController);

// collectionRoutes.post("/archivePost", archivePost);


export default collectionRoutes;