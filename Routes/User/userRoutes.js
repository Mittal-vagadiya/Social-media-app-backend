
import express from 'express';
import { createUserController, deleteUserController, followUserController, getAllUserController, getUserController, updateUserController } from '../../Controller/User/userController.js';
import { upload } from '../../helper.js';
import { AddToBlockListController, AddToCloseFriendRequestController, GetBlockedFriendsListController, GetCloseFriendsListController, GetFriendListController, GetFriendRequestController, RemoveFromBlockFriendRequestController, RemoveFromCloseFriendRequestController, SendFriendRequestController, UpdateFriendRequestController } from '../../Controller/User/friendRequestController.js';

const userRoutes = express.Router();

userRoutes.get('/getUser', getUserController);
userRoutes.get('/getAllUsers', getAllUserController);
userRoutes.delete('/deleteUser/:id', deleteUserController);
userRoutes.post('/createUser', upload.single("profile-file"), createUserController);
userRoutes.post('/updateUser', upload.single("profile-file"), updateUserController);

userRoutes.post('/followUser', followUserController);

//* friend request routes 
userRoutes.post('/sendFriendRequest', SendFriendRequestController);
userRoutes.post('/updateFriendRequest', UpdateFriendRequestController);
userRoutes.get('/getFriendRequest', GetFriendRequestController);
userRoutes.get('/getFriendList', GetFriendListController)
userRoutes.post("/addToCloseFriend", AddToCloseFriendRequestController)
userRoutes.get("/getCloseFriends", GetCloseFriendsListController)
userRoutes.post("/removeFromCloseFriends", RemoveFromCloseFriendRequestController)

//* block user routes
userRoutes.post("/addToBlockList", AddToBlockListController)
userRoutes.get("/getBlockedUserList", GetBlockedFriendsListController)
userRoutes.post("/removeFromBlockedFriends", RemoveFromBlockFriendRequestController)

export default userRoutes;