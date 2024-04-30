import { v4 as uuidv4 } from "uuid";
import { CreateResponse, formatDate } from "../../helper.js";
import { connection } from "../../Connection/dbConnection.js";

export const getPostController =  (req, res) => {
  const id = req.query.postId;
  const query = `SELECT 
  p.*, 
  (
    SELECT 
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'commentId', c.commentId,
          'content', c.content,
          'createdAt', c.createdAt,
          'replies', (
            SELECT 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'replyId', r.replyId,
                  'content', r.content,
                  'createdAt', r.createdAt
                    )
                  )
                FROM 
                  reply r
                WHERE 
                  r.commentId = c.commentId
                ORDER BY 
                  r.createdAt DESC
              )
            )
          )
        FROM 
          comments c
        WHERE 
          p.postId = c.postId
        ORDER BY 
          c.createdAt DESC
      ) AS comments
    FROM 
      post p
    WHERE 
      p.postId = ?`;


  try {
    connection.query(query, [id],  (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err));
      } 

        return  res
          .status(200)
          .json(CreateResponse(null, data[0], "Post Get SuccessFully!"));
    });
  } catch (err) {
    return  res.status(400).json(CreateResponse(err));
  }
};

export const getAllPostController =  (req, res) => {
  const userId = req?.user?.userId;
  const query = `
  SELECT 
    p.*, 
    (
      SELECT 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'commentId', c.commentId,
            'content', c.content,
            'createdAt', c.createdAt,
            'replies', (
              SELECT 
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'replyId', r.replyId,
                    'content', r.content,
                    'createdAt', r.createdAt
                  )
                )
              FROM 
                reply r
              WHERE 
                r.commentId = c.commentId
              ORDER BY 
                r.createdAt DESC
            )
          )
        )
      FROM 
        comments c
      WHERE 
        p.postId = c.postId
      ORDER BY 
        c.createdAt DESC
    ) AS comments
  FROM 
    post p
  WHERE 
    NOT p.userId = ?
  `;

  try {
    connection.query(query, [userId],  (err, data) => {
      if (err) return res.status(400).json(CreateResponse(err.sqlMessage));


        data.forEach((post) => {
          post.comments = JSON.parse(post.comments);
        });
      
        return res
          .status(200)
          .json(CreateResponse(null, data, "Posts Get Successfully!"));
    });
  } catch (err) {
    res.status(400).json(CreateResponse(err));
  }
};

export const deletePostController =  (req, res) => {
  const id = req.params.id;
  const findUserQuery = "SELECT * from post WHERE postId = ?";
  const query =
    "delete from post WHERE postId =? union delete from likes WHERE postId =?";
  let q =
    "DELETE FROM post INNER JOIN comment ON post.postId = comment.postId WHERE postId = ?";
  try {
    connection.query(q, [id], (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        if (data.length == 0) {
          return res
            .status(400)
            .json(CreateResponse(null, null, "Post Does not Exist"));
        } else {
          connection.query(query, [id, id],  (err, data) => {
            if (err) {
              return res
                .status(400)
                .json(CreateResponse(null, null, "Error in deleting post."));
            }
            return  res
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

export const createPostController =  (req, res) => {
  const { title, content, imageUrl } = req.body;
  const userId = req.user.userId;

  const findUserQuery =
    "ONSERT INTO post (userId,postId, title, content, createdAt, imageUrl) values(?)";
  const postId = uuidv4();
  const passData = [
    userId,
    postId,
    title,
    content,
    formatDate(),
    imageUrl,
  ];
  connection.query(findUserQuery, passData, (err, data) => {
    if (err) return res.status(400).json(CreateResponse(err.sqlMessage));

      res
        .status(200)
        .json(CreateResponse(null, null, "Post Created SuccessFully!"));
  });
};

export const updatePostController =  (req, res) => {
  const { postId, title, content, imageUrl } = req.body;

  const findUserQuery =
    "UPDATE post SET title = ?, content = ?, imageUrl = ? WHERE postId =?";

  const passData = [title, content, imageUrl, postId];
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

export const LikePostController =  (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId;
  const checkLike = "SELECT * FROM likes WHERE userId = ? AND postId = ?";
  const unlikePost = "DELETE FROM likes WHERE userId = ? AND postId = ?";
  const likePostQuery =
    "INSERT INTO likes (userId, postId, likeId) VALUES(?)";
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
