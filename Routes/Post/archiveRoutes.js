
import express from 'express';
import { AddToArchiveController, GetAllArchivePostController, GetArchivePostController, remvoeArchivePostController } from '../../Controller/Post/ArchiveController.js';

const archiverRoutes = express.Router();
archiverRoutes.post('/addToArchive', AddToArchiveController);

archiverRoutes.delete('/removeFromArchive', remvoeArchivePostController);

archiverRoutes.get('/getAllArchiveList', GetAllArchivePostController);

archiverRoutes.get('/getUserArchiveList', GetArchivePostController);


export default archiverRoutes;