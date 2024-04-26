
import express from 'express';
import { createUserController, deleteUserController, getAllUserController, getUserController } from '../../Controller/User/userController.js';

const userRoutes = express.Router();

userRoutes.get('/getUser/:id',getUserController);
userRoutes.get('/getAllUsers',getAllUserController);
userRoutes.delete('/deleteUser/:id',deleteUserController);
userRoutes.post('/createUser',createUserController);


export default userRoutes;