
import express from 'express';
import { AddPostToCollectionController, createCollectionController, deleteCollectionController, getUserCollectionsController, getrCollectionByIdController, removePostToCollectionController, updateUserCollectionController } from '../../Controller/Collections/CollectionsController.js';

const collectionRoutes = express.Router();

collectionRoutes.post('/createCollection', createCollectionController);
collectionRoutes.get('/getUserCollections', getUserCollectionsController);
collectionRoutes.post('/updateCollection', updateUserCollectionController);
collectionRoutes.post('/addPostToCollection', AddPostToCollectionController);
collectionRoutes.post('/removePostFromCollection', removePostToCollectionController);
collectionRoutes.get("/getCollectionById/:collectionId", getrCollectionByIdController);
collectionRoutes.delete("/deleteCollection/:collectionId", deleteCollectionController);

export default collectionRoutes;