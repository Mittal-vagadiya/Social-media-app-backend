import { connection } from "../../Connection/dbConnection.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { CreateResponse, updateData } from "../../helper.js";
import * as fs from 'fs';
import path from "path";

const salt = parseInt(process.env.SALT);

function RemoveImage(file){
  fs.unlink(path.join(path.resolve(), `/uploads/${file}`), function (err) {
    if (err) {
      console.log('err :>> ', err);
    }
    console.log('File deleted!');
  });
}

export const getUserController = async (req, res) => {
  const id = req.params.id;
  const query = "select * from user where userID = ?";
  let postQuery = `SELECT COUNT(p.postId) as numPosts
        FROM user u
        JOIN post p ON u.userId = p.userId
        WHERE u.userId =?`;
  await connection.query(query, [id], async (err, data) => {
    if (err) {
      return await res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      connection.query(postQuery, [id], async (err, PostData) => {
        if (err) {
          return await res.status(400).json(CreateResponse(err.sqlMessage));
        }
        const User = updateData(data)[0];
        User.posts = PostData[0].numPosts;
        return await res
          .status(200)
          .json(
            CreateResponse(null, User, "User Get SuccessFully!")
          );
      });
    }
  });
};

export const getAllUserController = async (req, res) => {
  const query = "select * from user";
  connection.query(query, async (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    }
    return await res
      .status(200)
      .json(CreateResponse(null, updateData(data), "Users Get SuccessFully!"));
  });
};

export const deleteUserController = async (req, res) => {
  const id = req.params.id;
  const findUserQuery = "select * from user where userId = ?";

  connection.query(findUserQuery, [id], (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      if (data.length == 0) {
        return res.status(400).json(CreateResponse("User Does not Exist"));
      }
      RemoveImage(data[0].profileImage)
      let q = 'DELETE FROM user WHERE userId=?';
      connection.query(q, [id], async (err, data) => {
        if (err) {
          return res.status(400).json(CreateResponse(err.sqlMessage));
        } else {
          const deletedUser = data[0];
          return await res
            .status(200)
            .json(CreateResponse(null, deletedUser, "User Deleted SuccessFully!"));
        }
      });
    }
  });
};

export const createUserController = async (req, res) => {
  const { userName, email, password, bio, age } = req.body;
  const AddUserQuery =
    "insert into user (userId,email,userName,password,bio,age,profileImage) values(?,?,?,?,?,?,?)";
  const userId = uuidv4();
  const hash = bcrypt.hashSync(password, salt);
  const passData = [userId, email, userName, hash, bio, age,req.file.filename];
  connection.query(AddUserQuery, passData, async (err, data) => {
    if (err) {
      RemoveImage(req.file.filename)
      return res.status(400).json(CreateResponse(err.sqlMessage));  
    } else {
      return await res
        .status(200)
        .json(CreateResponse(null, null, "User Created SuccessFully!"));
    }
  });
};


export const updateUserController = async (req, res) => {
  const { userId, userName, bio, age  } = req.body;
  const findUserQuery = 'select * from user where userId=?'
  const updateUserQuery =
    "update user set userName=?, bio=?, age=?, profileImage=? where userId=?";
  const passData = [userName, bio, age,req.file.filename,userId];

  connection.query(findUserQuery,[userId],(err,data) =>{
    if(err){
      return res.status(400).json(CreateResponse(null, null,"No User Found"));  
    } 

    RemoveImage(data[0].profileImage)
    connection.query(updateUserQuery, passData, async (err, data) => {
      if (err) {
        RemoveImage(req.file.filename)
        return res.status(400).json(CreateResponse(err.sqlMessage));  
      } else {
        return await res
          .status(200)
          .json(CreateResponse(null, null, "User Updated SuccessFully!"));
      }
    });
  })
};