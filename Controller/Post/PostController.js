import { v4 as uuidv4 } from "uuid";
import { CreateResponse, formatDate } from "../../helper.js";
import { connection } from "../../Connection/dbConnection.js";

export const getPostController = async (req, res) => {
  const id = req.params.id;
  const query = "select * from post where postId = ?";
  try {
    connection.query(query, [id], async (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err));
      } else {
        return await res
          .status(200)
          .json(CreateResponse(null, data[0], "Post Get SuccessFully!"));
      }
    });
  } catch (err) {
    return await res.status(400).json(CreateResponse(err));
  }
};

export const getAllPostController = async (req, res) => {
  const userId = req?.user?.userId;

  const query = `
  SELECT 
    p.*, 
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'commentId', c.commentId,
        'content', c.content,
        'createdAt', c.createdAt,
        'updatedAt', c.updatedAt
      )) AS comments
  FROM 
    post p
  LEFT JOIN 
    comments c ON p.postId = c.postId
  WHERE 
    NOT p.userId = ?
  GROUP BY 
    p.postId`;

  try {
    connection.query(query, [userId], async (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        data.forEach((post) => {
          post.comments = JSON.parse(post.comments);
        });
        return res
          .status(200)
          .json(CreateResponse(null, data, "Posts Get Successfully!"));
      }
    });
  } catch (err) {
    res.status(400).json(CreateResponse(err.sqlMessage));
  }
};

export const deletePostController = async (req, res) => {
  const id = req.params.id;
  const findUserQuery = "select * from post where postId = ?";
  const query = "delete from post where postId = ?";
  try {
    connection.query(findUserQuery, [id], (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        if (data.length == 0) {
          return res.status(400).json(CreateResponse("Post Does not Exist"));
        } else {
          connection.query(query, [id], async (err, data) => {
            return await res
              .status(200)
              .json(CreateResponse(null, null, "Post Deleted SuccessFully!"));
          });
        }
      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};

export const createPostController = async (req, res) => {
  const { title, content, createdAt, updatedAt, imageUrl } = req.body;
  const userId = req.user.userId;

  const findUserQuery =
    "insert into post (userId,postId, title, content, createdAt, updatedAt, imageUrl) values(?,?,?,?,?,?,?)";
  const postId = uuidv4();
  const passData = [
    userId,
    postId,
    title,
    content,
    formatDate(createdAt),
    formatDate(Date.now()),
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
  const { postId, title, content, imageUrl } = req.body;

  const findUserQuery =
    "UPDATE post SET title = ?, content = ?, updatedAt = ?, imageUrl = ? WHERE postId =?";

  const passData = [title, content, formatDate(Date, now()), imageUrl, postId];
  connection.query(findUserQuery, passData, (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      return res
        .status(200)
        .json(CreateResponse(null, null, "Post Updated SuccessFully!"));
    }
  });
};

export const LikePostController = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId;
  const checkLike = "select * from likes where userId = ? and  postId = ?";
  const unlikePost = "delete from likes where userId = ? and  postId = ?";
  const likePostQuery =
    "insert into likes (userId, postId, likeId) values(?,?,?)";
  const likeId = uuidv4();
  connection.query(checkLike, [userId, postId], (err, data) => {
    if (err) {
      return res.status(400).json(CreateResponse(err.sqlMessage));
    } else {
      if (data.length > 0) {
        connection.query(unlikePost, [userId, postId], (err, data) => {
          if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
          } else {
            return res
              .status(200)
              .json(CreateResponse(null, null, "Post UnLiked Successfully"));
          }
        });
      } else {
        connection.query(
          likePostQuery,
          [userId, postId, likeId],
          (err, data) => {
            if (err) {
              return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
              return res
                .status(200)
                .json(CreateResponse(null, null, "Post Liked Successfully"));
            }
          }
        );
      }
    }
  });
};
