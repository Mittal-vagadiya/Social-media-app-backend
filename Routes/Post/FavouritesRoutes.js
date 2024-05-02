
import express from 'express';
import { AddTofavouritesController, GetAllFavouritePostController, GetFavouritePostController, remvoeFavouritePostController } from '../../Controller/Post/FavourtiesController.js';

const favouritesRoutes = express.Router();
favouritesRoutes.post('/addToFavourite', AddTofavouritesController);

favouritesRoutes.delete('/removeFromFavourite', remvoeFavouritePostController);

favouritesRoutes.get('/getAllFavouriteList', GetAllFavouritePostController);

favouritesRoutes.get('/getUserFavouriteList', GetFavouritePostController);

export default favouritesRoutes;