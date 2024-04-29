import { connection } from "../../Connection/dbConnection.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { CreateResponse, removeField } from "../../helper.js";

const salt = parseInt(process.env.SALT);

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
        const User = removeField(data)[0];
        User.posts = PostData[0].numPosts;
        return await res
          .status(200)
          .json(
            CreateResponse(null, removeField(data)[0], "User Get SuccessFully!")
          );
      });
    }
  });
};

export const getAllUserController = async (req, res) => {
  const query = "select * from user";
  connection.query(query, async(err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    }
    return await res
      .status(200)
      .json(CreateResponse(null, removeField(data), "User Get SuccessFully!"));
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
      const query = "delete from user where userId = ?";
      connection.query(query, [id], async (err, data) => {
        if (err) {
          return res.status(400).json(CreateResponse(err.sqlMessage));
        } else {
          return await res
            .status(200)
            .json(CreateResponse(null, null, "User Deleted SuccessFully!"));
        }
      });
    }
  });
};

export const createUserController = async (req, res) => {
  const { userName, email, password, bio, age } = req.body;
  console.log('req.body :>> ', req.body);
  console.log('req.file :>> ', req.file);
  // const findUserQuery =
  //   "insert into user (userId,email,userName,password,bio,age) values(?,?,?,?,?,?)";
  // const userId = uuidv4();

  // const hash = bcrypt.hashSync(password, salt);

  // const passData = [userId, email, userName, hash, bio, age];
  // connection.query(findUserQuery, passData, async (err, data) => {
  //   if (err) {
  //     return res.status(400).json(CreateResponse(err.sqlMessage));
  //   } else {
  //     return await res
  //       .status(200)
  //       .json(CreateResponse(null, null, "User Created SuccessFully!"));
  //   }
  // });
};
