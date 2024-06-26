import { connection } from "../../Connection/dbConnection.js";
import { AddArchiveSchemaValidation, deleteArchiveSchemaValidation } from "../../Validations/archiveValidation.js";
import { UserIDValidation } from "../../Validations/userValidations.js";
import { CreateResponse, mergeAndRemoveDuplicates, removeMatchingItems } from "../../helper.js"
import { v4 as uuidv4 } from "uuid";

export const AddToArchiveController = (req, res) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    const { error } = AddArchiveSchemaValidation.validate({ postId, userId })
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    // Check if the post is already archived for the user
    const checkIfExistsQuery = "SELECT * FROM archive WHERE userId = ?";
    connection.query(checkIfExistsQuery, [userId, postId], async (err, result) => {
        if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
        }

        if (result.length == 0) {
            let stringPostIds = await mergeAndRemoveDuplicates(result.postId, postId)
            const addToArchiveQuery = "INSERT INTO archive (userId, postId, archiveId) VALUES (?, ?, ?)";
            const archiveId = uuidv4();
            const passData = [
                userId,
                stringPostIds,
                archiveId
            ];
            connection.query(addToArchiveQuery, passData, (err, data) => {
                if (err) {
                    return res.status(400).json(CreateResponse(err.sqlMessage));
                }
                res.status(200).json(CreateResponse(null, null, "Post Added Successfully to Archive!"));
            });
        } else {
            let stringPostIds = await mergeAndRemoveDuplicates(result[0].postId, postId)
            const updateToArchiveQuery = "UPDATE archive SET postId = ? WHERE userId = ?";
            const passDataUpdateDate = [
                stringPostIds,
                userId
            ];
            connection.query(updateToArchiveQuery, passDataUpdateDate, (err, data) => {
                if (err) {
                    return res.status(400).json(CreateResponse(err.sqlMessage));
                }
                res.status(200).json(CreateResponse(null, null, "Post Added Successfully to Archive!"));
            });
        }
    });
};

export const remvoeArchivePostController = (req, res) => {
    const { postId, archiveId } = req.body;
    const userId = req?.user?.userId;

    const { error } = deleteArchiveSchemaValidation.validate({ archiveId, userId });
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const query =
        "select * from archive WHERE archiveId =? and userId =?";
    let passData = [archiveId, userId];
    try {
        connection.query(query, passData, async (err, data) => {
            if (err) {
                return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
                let postIds = await removeMatchingItems(data[0].postId, postId)
                const updateToArchiveQuery = "UPDATE archive SET postId = ? WHERE userId = ?";
                const passDataUpdateDate = [
                    postIds,
                    userId
                ];
                connection.query(updateToArchiveQuery, passDataUpdateDate, (err, data) => {
                    if (err) {
                        return res.status(400).json(CreateResponse(err.sqlMessage));
                    }
                    res.status(200).json(CreateResponse(null, null, "Post Removed Successfully to Archive!"));
                });
            }
        });
    } catch (err) {
        return res.status(400).json(CreateResponse(err));
    }
};


export const GetArchivePostController = (req, res) => {
    const userId = req?.user?.userId;

    const { error } = UserIDValidation.validate({ id: userId });
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }
    const query = `
    SELECT 
    a.archiveId , a.userId,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'postId', p.postId,
                'title', p.title,
                'content', p.content,
                'created_at', p.createdAt,
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
        archive AS a
    INNER JOIN 
        post AS p ON FIND_IN_SET(p.postId, a.postId) > 0
    WHERE 
        a.userId = ?
    GROUP BY 
        a.archiveId
`;
    try {
        connection.query(query, [userId], async (err, data) => {
            if (err) {
                return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
                data.forEach((record) => {
                    record.postDetails = JSON.parse(record.postDetails)
                })
                res.status(200).json(CreateResponse(null, data, "Archive list fetched Successfully"));
            }
        });
    } catch (err) {
        return res.status(400).json(CreateResponse(err));
    }
};

export const GetAllArchivePostController = (req, res) => {

    const query = `
    SELECT 
         
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'postId', p.postId,
                'title', p.title,
                'content', p.content,
                'created_at', p.createdAt,
                'likes', (SELECT COUNT(*) FROM likes l WHERE l.postId = p.postId),
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
        archive AS a
    INNER JOIN 
        post AS p ON FIND_IN_SET(p.postId, a.postId) > 0
    GROUP BY 
        a.archiveId
`;
    try {
        connection.query(query, async (err, data) => {
            if (err) {
                return res.status(400).json(CreateResponse(err.sqlMessage));
            } else {
                data.forEach((record) => {
                    record.postDetails = JSON.parse(record.postDetails)
                })
                res.status(200).json(CreateResponse(null, data, "Archive list fetched Successfully"));
            }
        });
    } catch (err) {
        return res.status(400).json(CreateResponse(err));
    }
};


