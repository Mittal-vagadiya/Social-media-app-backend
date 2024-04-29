
import express from 'express';
import { createUserController, deleteUserController, getAllUserController, getUserController } from '../../Controller/User/userController.js';
import multer from 'multer';

const userRoutes = express.Router();

  const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb("Please upload only images.", false);
    }
  };
  
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.cwd() + "/Uploads/ProfileImages");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
    },
  });
  
  var uploadFile = multer({ storage: storage, fileFilter: imageFilter });

userRoutes.get('/getUser/:id',getUserController);
userRoutes.get('/getAllUsers',getAllUserController);
userRoutes.delete('/deleteUser/:id',deleteUserController);
userRoutes.post('/createUser',uploadFile.single("file"),createUserController);


export default userRoutes;