import { connection } from "../../Connection/dbConnection.js";
import { AddFavourtieSchemaValidation, deleteFavouriteSchemaValidation } from "../../Validations/favouritesValidation.js";
import { UserIDValidation } from "../../Validations/userValidations.js";
import { CreateResponse, mergeAndRemoveDuplicates, removeMatchingItems } from "../../helper.js"
import { v4 as uuidv4 } from "uuid";

export const AddTofavouritesController = (req, res) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    const { error } = AddFavourtieSchemaValidation.validate({ postId, userId })
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    // Check if the post is already archived for the user
    const checkIfExistsQuery = "SELECT * FROM favourites WHERE userId = ?";
    connection.query(checkIfExistsQuery, [userId, postId], async (err, result) => {
        if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
        }

        if (result.length == 0) {
            let stringPostIds = await mergeAndRemoveDuplicates(result.postId, postId)
            const addToFavouritesQuery = "INSERT INTO favourites (userId, postId, favouritesId) VALUES (?, ?, ?)";
            const favouritesId = uuidv4();
            const passData = [
                userId,
                stringPostIds,
                favouritesId
            ];
            connection.query(addToFavouritesQuery, passData, (err, data) => {
                if (err) {
                    return res.status(400).json(CreateResponse(err.sqlMessage));
                }
                res.status(200).json(CreateResponse(null, null, "Post Added Successfully to Favourites!"));
            });
        } else {
            let stringPostIds = await mergeAndRemoveDuplicates(result[0].postId, postId)
            const updateToFavouritesQuery = "UPDATE favourites SET postId = ? WHERE userId = ?";
            const passDataUpdateDate = [
                stringPostIds,
                userId
            ];
            connection.query(updateToFavouritesQuery, passDataUpdateDate, (err, data) => {
                if (err) {
                    return res.status(400).json(CreateResponse(err.sqlMessage));
                }
                res.status(200).json(CreateResponse(null, null, "Post Added Successfully to Favourites!"));
            });
        }
    });
};

export const remvoeFavouritePostController = (req, res) => {
    const { postId, favouritesId } = req.body;
    const userId = req?.user?.userId;

    const { error } = deleteFavouriteSchemaValidation.validate({ favouritesId, userId });
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const query =
        "select * from favourites WHERE favouritesId =? and userId =?";
    let passData = [favouritesId, userId];
    try {
        connection.query(query, passData, async (err, data) => {
            if (err) {
                return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
                let postIds = await removeMatchingItems(data[0].postId, postId)
                const updateToFavouritesQuery = "UPDATE favourites SET postId = ? WHERE userId = ?";
                const passDataUpdateDate = [
                    postIds,
                    userId
                ];
                connection.query(updateToFavouritesQuery, passDataUpdateDate, (err, data) => {
                    if (err) {
                        return res.status(400).json(CreateResponse(err.sqlMessage));
                    }
                    res.status(200).json(CreateResponse(null, null, "Post Removed Successfully to Favourites!"));
                });
            }
        });
    } catch (err) {
        return res.status(400).json(CreateResponse(err));
    }
};

export const GetFavouritePostController = (req, res) => {
    const userId = req?.user?.userId;

    const { error } = UserIDValidation.validate({ id: userId });
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }
    const query = `
    SELECT 
    f.favouritesId , f.userId,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'postId', p.postId,
                'title', p.title,
                'content', p.content,
                'created_at', p.createdAt,
                'likes',(SELECT COUNT(*) FROM likes l WHERE f.postId = p.postId),
                'user_Details',(
                   select JSON_OBJECT(
                        'proflieImage', u.profileImage,
                        'userName', u.userName,
                        'userId', u.userId
                    )
                    from user u
                    where u.userId = p.userId
                )
            )
        ) AS postDetails
    FROM 
        favourites AS f
    INNER JOIN 
        post AS p ON FIND_IN_SET(p.postId, f.postId) > 0
    WHERE 
        f.userId = ?
    GROUP BY 
        f.favouritesId
`;
    try {
        connection.query(query, [userId], async (err, data) => {
            if (err) {
                return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
                data.forEach((record) => {
                    record.postDetails = JSON.parse(record.postDetails)
                })
                res.status(200).json(CreateResponse(null, data, "Favourites list fetched Successfully"));
            }
        });
    } catch (err) {
        return res.status(400).json(CreateResponse(err));
    }
};

export const GetAllFavouritePostController = (req, res) => {

    const query = `
    SELECT 
    f.favouritesId , f.userId,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'postId', p.postId,
                'title', p.title,
                'content', p.content,
                'created_at', p.createdAt,
                'likes',(SELECT COUNT(*) FROM likes l WHERE f.postId = p.postId),
                'user_Details',(
                   select JSON_OBJECT(
                        'proflieImage', u.profileImage,
                        'userName', u.userName,
                        'userId', u.userId
                    )
                    from user u
                    where u.userId = p.userId
                )
            )
        ) AS postDetails
    FROM 
        favourites AS f
    INNER JOIN 
        post AS p ON FIND_IN_SET(p.postId, f.postId) > 0
    GROUP BY 
        f.favouritesId
`;
    try {
        connection.query(query, async (err, data) => {
            if (err) {
                return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
                data.forEach((record) => {
                    record.postDetails = JSON.parse(record.postDetails)
                })
                res.status(200).json(CreateResponse(null, data, "Favourties list fetched Successfully"));
            }
        });
    } catch (err) {
        return res.status(400).json(CreateResponse(err));
    }
};

