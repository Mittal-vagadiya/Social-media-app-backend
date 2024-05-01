import { v4 as uuidv4 } from "uuid";
import { CreateResponse, formatDate } from "../../helper.js";
import { connection } from "../../Connection/dbConnection.js";

export const getPostController = (req, res) => {
  const id = req.query.postId;
  const query = `SELECT 
  p.*,
  (SELECT COUNT(*) FROM likes l WHERE l.postId = p.postId) AS likes,
  (
    SELECT 
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'commentId', c.commentId,
          'content', c.content,
          'createdAt', c.createdAt,
          'commentor',  (JSON_OBJECT(
            'proflieImage', cu.profileImage,
            'userName', cu.userName,
            'userId', cu.userId
        )),
          'replies', (
            SELECT 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'replyId', r.replyId,
                  'content', r.content,
                  'createdAt', r.createdAt,
                  'replier',(
                    JSON_OBJECT(
                      'proflieImage', cu.profileImage,
                      'userName', cu.userName,
                      'userId', cu.userId
                    )
                  )
                    )
                  )
                FROM 
                  reply r
                JOIN user cu ON c.userId = cu.userId
                WHERE 
                  r.commentId = c.commentId
                ORDER BY 
                  r.createdAt DESC
              )
            )
          )
        FROM 
          comments c
        JOIN 
         user cu ON c.userId = cu.userId
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
    connection.query(query, [id], (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err));
      }
      data.forEach((post) => {
        post.comments = JSON.parse(post.comments);
      });
      return res
        .status(200)
        .json(CreateResponse(null, data[0], "Post Get SuccessFully!"));
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};

export const getAllPostController = (req, res) => {
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
    connection.query(query, [userId], (err, data) => {
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

export const deletePostController = (req, res) => {
  const id = req.params.id;
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
            .json(CreateResponse("Post Does not Exist"));
        } else {
          connection.query(query, [id, id], (err, data) => {
            if (err) {
              return res
                .status(400)
                .json(CreateResponse("Error in deleting post."));
            }
            return res
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

export const createPostController = (req, res) => {
  const { title, content, imageUrl } = req.body;
  const userId = req.user.userId;

  const findUserQuery =
    "INSERT INTO post (userId,postId, title, content, createdAt, imageUrl) values(?,?,?,?,?,?)";
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

export const updatePostController = (req, res) => {
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

export const LikePostController = (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId;
  const checkLike = "SELECT * FROM likes WHERE userId = ? AND postId = ?";
  const unlikePost = "DELETE FROM likes WHERE userId = ? AND postId = ?";
  const likePostQuery =
    "INSERT INTO likes (userId, postId, likeId) VALUES(?,?,?)";
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

export const getUserPostController = (req, res) => {
  const userId = req.user?.userId;
  const query = `
        SELECT p.*, u.userId, u.profileImage, u.email, u.userName,
        (SELECT COUNT(*) FROM likes l WHERE l.postId = p.postId) AS likes
        ,(SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'commentId', c.commentId,
                    'content', c.content,
                    'createdAt', c.createdAt,
                    'commentor',  (JSON_OBJECT(
                        'proflieImage', cu.profileImage,
                        'userName', cu.userName,
                        'userId', cu.userId
                    )),
                    'replies', (SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'replyId', r.replyId,
                                        'content', r.content,
                                        'createdAt', r.createdAt,
                                        'replier',(
                                          JSON_OBJECT(
                                            'proflieImage', cu.profileImage,
                                            'userName', cu.userName,
                                            'userId', cu.userId
                                          )
                                        )
                                    )
                                )
                                FROM reply r
                                JOIN user cu ON c.userId = cu.userId
                                WHERE c.commentId = r.commentId
                                ORDER BY r.createdAt
                            )
                )
            )
        FROM comments c
        JOIN user cu ON c.userId = cu.userId
        WHERE c.postId = p.postId
        ORDER BY c.createdAt
        ) AS comments
      FROM post p
      INNER JOIN user u ON u.userId = p.userId
      WHERE u.userId = ?
      GROUP BY p.postId;
  `;
  try {
    connection.query(query, [userId], (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err));
      }
      data.forEach((post) => {
        post.comments = JSON.parse(post.comments);
      });

      return res
        .status(200)
        .json(CreateResponse(null, data, "Post Get SuccessFully!"));
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};

export const filterPostController = (req, res) => {
  const { orderBy, filterPeriod, startDate, endDate, AuthorId } = req.query;

  if (orderBy && !['New to old', 'Old to new'].includes(orderBy)) {
    return res.status(400).json(CreateResponse("Invalid value for orderBy. Only 'New to old' and 'Old to new' are allowed."));
  }
  let orderByFilter = '';

  if (orderBy) { // Default order by createdA
    if (orderBy === 'New to old') {
      orderByFilter = `ORDER BY createdAt DESC`;
    } else {
      orderByFilter = `ORDER BY createdAt ASC`;
    }
  }

  let dateFilter = '';
  switch (filterPeriod) {
    case 'pastWeek':
      dateFilter = 'createdAt >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      break;
    case 'pastMonth':
      const currentMonth = new Date().getMonth();
      dateFilter = `MONTH(createdAt) = ${currentMonth - 1}`;
      break;
    case 'pastYear':
      const currentYear = new Date().getFullYear();
      dateFilter = `YEAR(createdAt) = ${currentYear - 1}`;
      break;
    case 'dateRange':
      if (!startDate || !endDate) {
        return res.status(400).json(CreateResponse("Both start and end dates are required for date range filtering."));
      }

      if (startDate && endDate) {
        dateFilter = `createdAt BETWEEN '${startDate}' AND '${endDate}'`;
      } else {
        // Default to the current date if startDate or endDate is not provided
        dateFilter = `createdAt BETWEEN NOW() AND NOW()`;
      }
      break;
    default:
      break;
  }

  let authorFilter = '';
  if (AuthorId) {
    const authorIds = Array.isArray(AuthorId) ? AuthorId : [AuthorId];
    authorFilter = `${dateFilter !== '' ? 'AND' : ''} userId IN (${authorIds.map(id => connection.escape(id)).join(',')})`;
  };

  const query = `SELECT * FROM post WHERE ${dateFilter} ${authorFilter} ${orderByFilter}`;
  try {
    connection.query(query, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err));
      }
      return res.status(200).json(CreateResponse(null, data, "Posts retrieved successfully!"));
    });
  } catch (error) {
    return res.status(400).json(CreateResponse(error));
  }
}
