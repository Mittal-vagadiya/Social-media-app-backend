import { v4 as uuidv4 } from "uuid";
import { CreateResponse, formatDate } from "../../helper.js";
import { connection } from "../../Connection/dbConnection.js";

export const deleteCommentController = async (req, res) => {
  const id = req.params.id;
  const findUserQuery = "select * from comments where commentId = ?";
  const query = "delete from comments where commentId = ?";
  try {
    connection.query(findUserQuery, [id], (err, data) => {
      if (data.length == 0) {
        return res.status(400).json(CreateResponse("Comment Does not Exist"));
      } else {
        connection.query(query, [id], async (err, data) => {
          return await res
            .status(200)
            .json(CreateResponse(null, null, "Comment Deleted SuccessFully!"));
        });
      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err.sqlMessage));
  }
};

export const createCommentController = async (req, res) => {
  const { postId, content, createdAt } = req.body;
  const userId = req?.user?.userId;
  const findUserQuery =
    "insert into comments (commentId, content, postId, userId, createdAt, updatedAt) values(?,?,?,?,?,?)";

  const commentId = uuidv4();
  const passData = [
    commentId,
    content,
    postId,
    userId,
    formatDate(createdAt),
    formatDate(),
  ];
  try {
    connection.query(findUserQuery, passData, async (err, data) => {
      if (err) {
        res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        await res
          .status(200)
          .json(CreateResponse(null, null, "Comment created successfully!"));
      }
    });
  } catch (err) {
    res.status(400).json(CreateResponse(err.sqlMessage));
  }
};

export const updateCommentController = async (req, res) => {
  const { commentId, content } = req.body;

  const updateCommentQuery =
    "UPDATE comments SET content = ?, updatedAt = ? WHERE commentId = ?";

  const passData = [content, formatDate(), commentId];
  connection.query(updateCommentQuery, passData, (err, data) => {
    if (err) {
      res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      res
        .status(200)
        .json(CreateResponse(null, null, "Comment Updated SuccessFully!"));
    }
  });
};