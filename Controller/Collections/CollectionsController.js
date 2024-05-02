import { CreateResponse, mergeAndRemoveDuplicates } from "../../helper.js"
import { v4 as uuidv4 } from "uuid";
import { connection } from "../../Connection/dbConnection.js";
import { CollectionIdSchema, addPostToCollectionSchema, createCollectionSchema, getCollectionSchema, updateCollectionSchema } from "../../Validations/CollectionValidations.js";

export const createCollectionController = (req, res) => {
  try {
    const { collectionType, collectionName, collaborator, postId } = req.body;
    const userId = req?.user?.userId;
    const { error } = createCollectionSchema.validate(req.body);
    if (error) {
      res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
    }

    if (!userId) {
      return res.status(400).json(CreateResponse("User ID is required."));
    }

    const findNameQuery = 'SELECT * FROM collections WHERE LOWER(collectionName) = LOWER(?) and userId = ?';

    connection.query(findNameQuery, [collectionName.trim(),userId], (err, data) => {
      if (err){ return res.status(400).json(CreateResponse(err.sqlMessage));}
      if (data.length !== 0) {
        return res.status(400).json(CreateResponse('Collection with given name already exist.'))
      }

      let collectionQuery, collectionData;
      if (collectionType === 'Public') {
        collectionQuery = "INSERT INTO collections (collectionId, userId, collectionType, collectionName, collaborator, postIds) VALUES (?, ?, ?, ?, ?, ?)";
        collectionData = [uuidv4(), userId, collectionType, collectionName, JSON.stringify(collaborator || []), JSON.stringify(postId || [])];
      } else {
        collectionQuery = "INSERT INTO collections (collectionId, userId, collectionType, collectionName, postIds) VALUES (?, ?, ?, ?, ?)";
        collectionData = [uuidv4(), userId, collectionType, collectionName, JSON.stringify(postId || [])];
      }

      connection.query(collectionQuery, collectionData, (err, data) => {
        if (err) {
          return res.status(500).json(CreateResponse(err.sqlMessage || "Error in creating collection."));
        }
        const successMessage = collectionType === 'Public' ? "Public Collection Created Successfully!" : "Collection Created Successfully!";
        res.status(200).json(CreateResponse(null, null, successMessage));
      });
      
    });

  } catch (error) {
    res.status(400).json(CreateResponse(error))
  }
}

export const getUserCollectionsController = (req, res) => {
  try {
    const userId = req?.user?.userId;
    const { error } = getCollectionSchema.validate({ userId });
    if (error) {
      return res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const findAllCollectionsWithPostsQuery = `
    SELECT 
        c.collectionId,
        c.userId,
        c.collectionName,
        c.collectionType,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'userId', u.userId,
              'profileImage', u.profileImage
            )
          ) 
          FROM user u 
          WHERE JSON_CONTAINS(c.collaborator, JSON_QUOTE(u.userId)) > 0
        ) AS collaborators,
        JSON_ARRAYAGG(JSON_OBJECT('postId', p.postId, 
        'content', p.content,
        'title',p.title,
        'imageUrl',p.imageUrl
      )) as posts
    FROM 
        collections c
    LEFT JOIN 
        post p ON JSON_CONTAINS(c.postIds, JSON_QUOTE(p.postId)) > 0
    WHERE 
        c.userId = ? or JSON_CONTAINS(c.collaborator, JSON_QUOTE(?)) > 0
    GROUP BY 
        c.collectionId;
`;

    connection.query(findAllCollectionsWithPostsQuery, [userId,userId], (err, data) => {
      if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
      data.forEach((post) => {
        post.posts = JSON.parse(post.posts);
        post.collaborators = JSON.parse(post.collaborators);
      });

      res
        .status(200)
        .json(CreateResponse(null, data));
    })

  } catch (error) {
    return res.status(400).json(CreateResponse(error))
  }
}

export const getrCollectionByIdController = (req, res) => {
  try {
    const collectionId = req.params.collectionId;
    const userId = req?.user?.userId;
    const { error } = CollectionIdSchema.validate({ collectionId });
    if (error) {
      return res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const getCollectionByIdQuery = `
    SELECT 
        c.collectionId,
        c.userId,
        c.collectionName,
        c.collectionType,
        JSON_ARRAYAGG(JSON_OBJECT('postId', p.postId, 
        'content', p.content,
        'title',p.title,
        'imageUrl',p.imageUrl
        )) as posts
    FROM 
        collections c
    LEFT JOIN 
        post p ON JSON_CONTAINS(c.postIds, JSON_QUOTE(p.postId)) > 0
    WHERE 
        c.collectionId = ? AND c.userId = ?;
`;

    connection.query(getCollectionByIdQuery, [collectionId, userId], (err, data) => {
      if (err) return res.status(400).json(CreateResponse(err.sqlMessage));

      if (data.length === 0) return res.status(400).json(CreateResponse('Collection Does not Exist.'));

      data.forEach((post) => {
        post.posts = JSON.parse(post.posts);
      });

      res
        .status(200)
        .json(CreateResponse(null, data));
    })

  } catch (error) {
    return res.status(400).json(CreateResponse(error))
  }
}

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

export const AddPostToCollectionController = (req, res) => {
  const { collectionId, postId } = req.body;
  const userId = req?.user?.userId;

  const { error } = addPostToCollectionSchema.validate(req.body);
  if (error) {
    return res.status(400).json(CreateResponse(error.details.map((item) => item.message)));
  }

  const checkCollection = 'SELECT * FROM collections WHERE collectionId = ?';

  try {
    connection.query(checkCollection, [collectionId], async (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      }
      if (data.length === 0) {
        return res.status(400).json(CreateResponse('Collection does not exist.'));
      }
      let stringPostIds = await mergeAndRemoveDuplicates(data[0].postIds, postId)
      const addToFavouritesQuery = "UPDATE collections SET postIds = ? where collectionId = ? And userId = ?";
      const passData = [
        stringPostIds,
        collectionId,
        userId
      ];
      connection.query(addToFavouritesQuery, passData, (err, data) => {
        if (err) {
          return res.status(400).json(CreateResponse(err.sqlMessage));
        }
        res.status(200).json(CreateResponse(null, null, "Post Added Successfully to Collections!"));
      });
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

  const query =
    "select * from collections WHERE collectionId =? and userId =?";
  const passData = [collectionId, userId];
  try {
    connection.query(query, passData, (err, data) => {
      if (err) {
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {
        const removeFromCollectionQuery = "UPDATE collections SET postIds = ? WHERE collectionId =? and userId = ?";
        const passDataUpdateDate = [
          postId,
          collectionId,
          userId
        ];
        connection.query(removeFromCollectionQuery, passDataUpdateDate, (err, data) => {
          if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
          }
          res.status(200).json(CreateResponse(null, null, "Post Removed Successfully from Collection!"));
        });

      }
    });
  } catch (error) {
    return res.status(400).json(CreateResponse(error));
  }
};

export const deleteCollectionController = (req, res) => {
  const collectionId = req.params.collectionId;
  const userId = req?.user?.userId;
  const { error } = CollectionIdSchema.validate({ collectionId });
  if (error) {
    return res.status(400).json(CreateResponse(error.details.map((item) => item.message)))
  }

  const query =
    "delete from collections WHERE collectionId =? AND userId = ?";
  try {
    connection.query(query, [collectionId, userId], (err, data) => {
      if (err) {
        console.log('err :>> ', err);
        return res.status(400).json(CreateResponse(err.sqlMessage));
      } else {

        if (data.affectedRows > 0) {
          return res
            .status(200)
            .json(CreateResponse(null, null, "Collection Deleted SuccessFully!"));

        } else {
          return res.status(400).json(CreateResponse("Collection Does not exist"));
        }
      }
    });
  } catch (error) {
    return res.status(400).json(CreateResponse(error));
  }
};