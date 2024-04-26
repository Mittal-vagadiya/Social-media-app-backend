import { v4 as uuidv4 } from "uuid";
import { CreateResponse } from "../../helper.js";
import { connection } from "../../Connection/dbConnection.js";

export const getPostController = async (req, res) => {
  const id = req.params.id;
  const query = "select * from post where postId = ?";
  await connection.query(query, [id], async (err, data) => {
    if (err) {
      await res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      await res
        .status(200)
        .json(CreateResponse(null, data[0], "Post Get SuccessFully!"));
    }
  });
};

export const getAllPostController = async (req, res) => {
  const userId = req.user.userId.userId;
  const query = "select * from post where not userId = ?";

  connection.query(query, [userId], (err, data) => {
    if (err) {
      res.status(400).json(CreateResponse(err.sqlMessage));
    }
    res.status(200).json(CreateResponse(null, data, "Posts Get SuccessFully!"));
  });
};

export const deletePostController = async (req, res) => {
  const id = req.params.id;
  const findUserQuery = "select * from post where postId = ?";

  connection.query(findUserQuery, [id], (err, data) => {
    if (err) {
      res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      if (data.length == 0) {
        res.status(400).json(CreateResponse("Post Does not Exist"));
      }
      const query = "delete from post where postId = ?";
      connection.query(query, [id], (err, data) => {
        if (err) {
          res.status(400).json(CreateResponse(err.sqlMessage));
        }
        res
          .status(200)
          .json(CreateResponse(null, null, "Post Deleted SuccessFully!"));
      });
    }
  });
};

export const createPostController = async (req, res) => {
  const { title, content, createdAt, updatedAt, imageUrl } = req.body;
  const userId = req.user.userId.userId;

  const findUserQuery =
    "insert into post (userId,postId, title, content, createdAt, updatedAt, imageUrl) values(?,?,?,?,?,?,?)";
  const postId = uuidv4();
  const passData = [
    userId,
    postId,
    title,
    content,
    createdAt,
    updatedAt,
    imageUrl,
  ];
  connection.query(findUserQuery, passData, (err, data) => {
    if (err) {
      res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      res
        .status(200)
        .json(CreateResponse(null, null, "Post Created SuccessFully!"));
    }
  });
};

export const updatePostController = async (req, res) => {
    const {postId, title, content, updatedAt, imageUrl } = req.body;
    const userId = req.user.userId.userId;
    
    const findUserQuery = 'UPDATE post SET title = ?, content = ?, updatedAt = ?, imageUrl = ? WHERE postId =?'

    const passData = [
      title,
      content,
      updatedAt,
      imageUrl,
      postId
    ];
    connection.query(findUserQuery, passData, (err, data) => {
      if (err) {
        res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        res
          .status(200)
          .json(CreateResponse(null, null, "Post Updated SuccessFully!"));
      }
    });
};