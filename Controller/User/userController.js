import { connection } from "../../Connection/dbConnection.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { CreateResponse, updateData } from "../../helper.js";
import * as fs from "fs";
import path from "path";
import { UserIDValidation, followerUserSchemaValidation, updateUserSchemaValidation, userSchemaValdation } from "../../Validations/userValidations.js";

const salt = parseInt(process.env.SALT);

function RemoveImage(file) {
  fs.unlink(path.join(path.resolve(), `/uploads/${file}`), function (err) {
    if (err) {
      console.log("err :>> ", err);
    }
    console.log("File deleted!");
  });
}

export const getUserController = (req, res) => {
  const id = req.query.userId;

  const { error } = UserIDValidation.validate({id:id});
  if (error) {
    return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
  }

  let postQuery = `SELECT 
                    u.*,
                    COUNT(p.postId) AS numPosts
                  FROM 
                    user u
                  LEFT JOIN 
                    post p ON u.userId = p.userId
                  WHERE 
                    u.userId = ?`;

  let followersQuery = `SELECT 
    COUNT(followerId) AS followCount FROM followers WHERE userId = ?
`;

  try {
    connection.query(postQuery, [id], (err, PostData) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      }
      let User = updateData(PostData)[0];
      connection.query(followersQuery, [id], (err, data) => {
        User.followers = data[0].followCount;
        return res
          .status(200)
          .json(CreateResponse(null, User, "User Get SuccessFully!"));
      });
    });
  } catch (error) {
    res.status(400).json(CreateResponse(error))
  }
};

export const getAllUserController = (req, res) => {
  const query = "SELECT * FROM user";
  connection.query(query, (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    }
    return res
      .status(200)
      .json(CreateResponse(null, updateData(data), "Users Get SuccessFully!"));
  });
};

export const deleteUserController = (req, res) => {
  const id = req.params.id;

  const { error } = UserIDValidation.validate({id});
  if (error) {
    return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const findUserQuery = "SELECT * FROM user WHERE userId = ?";

  connection.query(findUserQuery, [id], (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      if (data.length == 0) {
        return res.status(400).json(CreateResponse("User Does not Exist"));
      }
      RemoveImage(data[0].profileImage);
      let q = "DELETE FROM user WHERE userId=?";
      connection.query(q, [id], (err, data) => {
        if (err) {
          return res.status(400).json(CreateResponse(err.sqlMessage));
        } else {
          const deletedUser = data[0];
          return res
            .status(200)
            .json(
              CreateResponse(null, deletedUser, "User Deleted SuccessFully!")
            );
        }
      });
    }
  });
};

export const createUserController = (req, res) => {
  const { userName, email, password, bio, age } = req.body;

  const { error } = userSchemaValdation.validate(req.body);
  if (error) {
    return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const AddUserQuery =
    "INSERT INTO user (userId,email,userName,password,bio,age,profileImage) VALUES(?,?,?,?,?,?,?)";
  const userId = uuidv4();
  const hash = bcrypt.hashSync(password, salt);
  const passData = [userId, email, userName, hash, bio, age, req.file.filename];
  connection.query(AddUserQuery, passData, (err, data) => {
    if (err) {
      RemoveImage(req.file.filename);
      return res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      return res
        .status(200)
        .json(CreateResponse(null, null, "User Created SuccessFully!"));
    }
  });
};

export const updateUserController = async (req, res) => {
  const { userId, userName, bio, age } = req.body;
  
  const { error } = updateUserSchemaValidation.validate(req.body);
  if (error) {
    return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const findUserQuery = "SELECT * FROM user WHERE userId=?";
  const updateUserQuery =
    "UPDATE user SET userName=?, bio=?, age=?, profileImage=? WHERE userId=?";
  const passData = [userName, bio, age, req.file.filename, userId];

  connection.query(findUserQuery, [userId], (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(null, null, "No User Found"));
    }

    RemoveImage(data[0].profileImage);
    connection.query(updateUserQuery, passData, (err, data) => {
      if (err) {
        RemoveImage(req.file.filename);
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        return res
          .status(200)
          .json(CreateResponse(null, null, "User Updated SuccessFully!"));
      }
    });
  });
};

export const followUserController = (req, res) => {
  const { follower } = req.body;
  const userId = req.user.userId;

  const { error } = followerUserSchemaValidation.validate({id:userId,follower});
  if (error) {
    return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const followUserQuery =
    "SELECT * FROM followers WHERE userId = ? AND follower = ?";
  const insertFollowQuery =
    "INSERT INTO followers (followerId, userId, follower) VALUES (?)";
  const deleteFollowQuery =
    "DELETE FROM followers WHERE userId = ? AND follower = ?";

  const followerId = uuidv4();
  connection.query(followUserQuery, [userId, follower], (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      if (data.length > 0) {
        connection.query(deleteFollowQuery, [userId, follower], (err, data) => {
          if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
          } else {
            return res
              .status(200)
              .json(CreateResponse(null, null, "Unfollow Successfully"));
          }
        });
      } else {
        connection.query(
          insertFollowQuery,
          [followerId, userId, follower],
          (err, data) => {
            if (err) {
              return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
              return res
                .status(200)
                .json(CreateResponse(null, null, "User follow Successfully"));
            }
          }
        );
      }
    }
  });
};