import { v4 as uuidv4 } from "uuid";
import { CreateResponse, formatDate } from "../../helper.js";
import { connection } from "../../Connection/dbConnection.js";

export const deleteCommentController = (req, res) => {
  const id = req.params.id;
  const findUserQuery = "SELECT * FROM comments WHERE commentId = ?";
  const query = "DELETE FROM comments WHERE commentId = ?";
  try {
    connection.query(findUserQuery, [id], (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      }
      if (data.length == 0) {
        return res.status(400).json(CreateResponse("Comment Does not Exist"));
      } else {
        connection.query(query, [id], (err, data) => {
          if (err) {
            return res.status(400).json(CreateResponse("Error in Deleting Post"));
          }
          return res
            .status(200)
            .json(CreateResponse("Comment Deleted SuccessFully!"));
        });
      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};

export const createCommentController = (req, res) => {
  const { postId, content } = req.body;
  const userId = req?.user?.userId;
  const findUserQuery =
    "INSERT INTO comments (commentId, content, postId, userId, createdAt) VALUES(?,?,?,?,?)";

  const commentId = uuidv4();
  const passData = [
    commentId,
    content,
    postId,
    userId,
    formatDate()
  ];
  try {
    connection.query(findUserQuery, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        return res
          .status(200)
          .json(CreateResponse("Comment created successfully!"));
      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err.sqlMessage));
  }
};

export const updateCommentController = async (req, res) => {
  const { commentId, content } = req.body;

  const updateCommentQuery =
    "UPDATE comments SET content = ? WHERE commentId = ?";

  const passData = [content, commentId];

  try {
    connection.query(updateCommentQuery, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        return res
          .status(200)
          .json(CreateResponse("Comment Updated SuccessFully!"));
      }
    });

  } catch (error) {
    return res.status(400).json(CreateResponse(error))
  }
};

export const replyCommentController = (req, res) => {
  const { commentId, postId, content } = req.body;
  const userId = req?.user?.userId;
  const addReplyQuery =
    "INSERT INTO reply (replyId, commentId, userId, postId, content, createdAt) VALUES(?,?,?,?,?,?)";

  const replayId = uuidv4();
  const passData = [
    replayId,
    commentId,
    userId,
    postId,
    content,
    formatDate()
  ];
  try {
    connection.query(addReplyQuery, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        return res
          .status(200)
          .json(CreateResponse("Reply added successfully!"));
      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};


export const deletereplyCommentController = (req, res) => {
  const replayId = req?.params?.id;
  const addReplyQuery =
    "DELETE FROM reply WHERE replyId = ?";
  try {
    connection.query(addReplyQuery, [replayId], (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        return res
          .status(200)
          .json(CreateResponse("Reply deleted successfully!"));
      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};


export const updatereplyCommentController = (req, res) => {
  const { content, replyId } = req.body;

  const updateReplyQuery =
    "UPDATE reply SET content=? WHERE replyId=?";
  const passData = [
    content, replyId
  ]

  try {
    connection.query(updateReplyQuery, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        return res
          .status(200)
          .json(CreateResponse("Reply Updated successfully!"));

      }
    });
  } catch (err) {
    return res.status(400).json(CreateResponse(err));
  }
};



export const filterCommentController = (req, res) => {
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
    authorFilter = `${dateFilter != '' ? 'AND' : ""} userId = ${AuthorId}`;
  }

  const query = `SELECT * FROM comments WHERE ${dateFilter} ${authorFilter} ${orderByFilter}`;
  try {
    connection.query(query, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err));
      }
      return res.status(200).json(CreateResponse(null, data, "Comments retrieved successfully!"));
    });
  } catch (error) {
    console.log('error :>> ', error);
    return res.status(400).json(CreateResponse(error));
  }
}