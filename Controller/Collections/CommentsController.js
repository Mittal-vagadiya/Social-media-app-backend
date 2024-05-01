import Joi from "joi";
import { CreateResponse } from "../../helper.js"
import { v4 as uuidv4 } from "uuid";
import { connection } from "../../Connection/dbConnection.js";

const createCollectionSchema = Joi.object({
  collectionType: Joi.string().valid('Public', 'Private').required(),
  collectionName: Joi.string().required().messages({
    'string.empty': "Collection Name is required"
  }),
}, { abortEarly: false });

export const createCollectionController = (req, res) => {
  try {
    const { collectionType, collectionName } = req.body;
    const userId = req?.user?.userId;
    const { error } = createCollectionSchema.validate(req.body);
    if (error) {
      res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const findNameQuery = 'SELECT * FROM collections WHERE LOWER(collectionName) = LOWER(?)';
    const InsertCollectionQuery =
      "INSERT INTO collections (collectionId, userId, collectionType,collectionName) VALUES(?,?,?,?)";
    const collectionId = uuidv4();
    const passData = [
      collectionId,
      userId,
      collectionType,
      collectionName
    ];

    connection.query(findNameQuery, collectionName.trim(), (err, data) => {
      if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
      if (data.length !== 0) {
        return res.status(400).json(CreateResponse('Collection with given name already exist.'))
      }
      connection.query(InsertCollectionQuery, passData, (err, data) => {
        if (err) return res.status(400).json(CreateResponse('Error in creating Collection.'));
        res
          .status(200)
          .json(CreateResponse(null, null, "Collection Created SuccessFully!"));
      })
    });

  } catch (error) {
    res.status(400).json(CreateResponse(error))
  }
}


const getCollectionSchema = Joi.object({
  userId: Joi.string().required().messages({ 'string.empty': "UserId is required" })
});

export const getUserCollectionsController = (req, res) => {
  try {
    const userId = req?.user?.userId;
    const { error } = getCollectionSchema.validate({ userId });
    if (error) {
      return res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const findNameQuery = 'SELECT * FROM collections WHERE userId = ?';

    connection.query(findNameQuery, [userId], (err, data) => {
      if (err) return res.status(400).json(CreateResponse(err.sqlMessage));

      res
        .status(200)
        .json(CreateResponse(null, data));
    })

  } catch (error) {
    return res.status(400).json(CreateResponse(error))
  }
}


const updateCollectionSchema = Joi.object({
  collectionId: Joi.string().required().messages({
    'string.empty': "Collection Id is required"
  }),
  collectionType: Joi.string().valid('Public', 'Private').required(),
  collectionName: Joi.string().required().messages({
    'string.empty': "Collection Name is required"
  })
}, { abortEarly: false });

export const updateUserCollectionController = (req, res) => {
  const { collectionId, collectionType, collectionName } = req.body;

  const { error } = updateCollectionSchema.validate(req.body);
  if (error) {
    res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const updateCollectionQuery =
    `UPDATE collections SET collectionType = ?, collectionName = ? WHERE collectionId = ?`;

  const passData = [collectionType, collectionName, collectionId];
  try {
    connection.query(updateCollectionQuery, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        return res
          .status(200)
          .json(CreateResponse(null, null, "Post Updated SuccessFully!"));
      }
    });
  } catch (error) {
    return res.status(400).json(CreateResponse(error));
  }
};


const addPostToCollectionSchema = Joi.object({
  collectionId: Joi.string().required().messages({
    'string.empty': "Collection Id is required"
  }),
  postId: Joi.array().required(),
}, { abortEarly: false });

export const AddPostToCollectionController = (req, res) => {
  const { collectionId, postId } = req.body;

  const { error } = addPostToCollectionSchema.validate(req.body);
  if (error) {
    return res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const updateCollectionQuery = `UPDATE collections
  SET postIds = ?
  WHERE collectionId = ?;`;
  const passData = [JSON.stringify(postId), collectionId];
  try {
    connection.query(updateCollectionQuery, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      }
      return res.status(200).json(CreateResponse(null, null, "Posts Added Successfully to Collection!"));
    });

  } catch (error) {
    return res.status(400).json(CreateResponse(error));
  }
};



export const removePostToCollectionController = (req, res) => {
  const { collectionId, postId } = req.body;
  const userId = req?.user?.userId;

  const { error } = addPostToCollectionSchema.validate(req.body);
  if (error) {
    return res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const updateCollectionQuery = `UPDATE collections  SET postIds = JSON_REMOVE(postIds, JSON_UNQUOTE(JSON_SEARCH(postIds, 'all', ?))) 
  WHERE collectionId = ? AND userId = ?`;

  const passData = [postId, collectionId, userId];
  try {
    connection.query(updateCollectionQuery, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      }
      return res.status(200).json(CreateResponse(null, null, "Posts Removed Successfully from Collection!"));
    });

  } catch (error) {
    return res.status(400).json(CreateResponse(error));
  }
};

export const deleteCollectionController = (req, res) => {
  const id = req.params.id;
  const query =
    "delete from collections WHERE collectionId =?";
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