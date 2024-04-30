
import express from 'express';
import { createUserController, deleteUserController, getAllUserController, getUserController, updateUserController } from '../../Controller/User/userController.js';
import { upload } from '../../helper.js';

const userRoutes = express.Router();

userRoutes.get('/getUser/:id',getUserController);
userRoutes.get('/getAllUsers',getAllUserController);
userRoutes.delete('/deleteUser/:id',deleteUserController);
userRoutes.post('/createUser',upload.single("profile-file"),createUserController);
userRoutes.post('/updateUser',upload.single("profile-file"),updateUserController);

export default userRoutes;