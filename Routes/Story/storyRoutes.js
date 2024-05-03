
import express from 'express';
import { AddStoryController, DeleteStoryController, GetAllStoriesController, GetUserStoriesController, UpdateStoryController } from '../../Controller/Stories/StoriesController.js';
import { uploadStory } from '../../helper.js';

const storyRoutes = express.Router();

storyRoutes.post('/createStory', uploadStory.single("story-image"), AddStoryController);
storyRoutes.get('/getUserStories', GetUserStoriesController);
storyRoutes.get('/getAllStories', GetAllStoriesController);
storyRoutes.post('/deleteStory', DeleteStoryController);
storyRoutes.post('/updateStory', uploadStory.single("story-image"), UpdateStoryController);



export default storyRoutes;