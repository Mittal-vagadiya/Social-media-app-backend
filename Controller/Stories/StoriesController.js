import { CreateResponse, formatDate } from "../../helper.js";
import { connection } from "../../Connection/dbConnection.js";
import { createStoryValidationSchema, deleteStoryValidationSchema, updateStoryValidationSchema } from "../../Validations/storiesValidations.js";
import { v4 as uuidv4 } from "uuid";
import { UserIDValidation } from "../../Validations/userValidations.js";
import * as fs from "fs";
import path from "path";

function RemoveImage(file) {
    fs.unlink(path.join(path.resolve(), `/uploads/stories/${file}`), function (err) {
        if (err) {
            console.log("err :>> ", err);
        }
        console.log("File deleted!");
    });
}

export const AddStoryController = (req, res) => {
    const { storyType } = req.body;
    const userId = req?.user?.userId;

    const { error } = createStoryValidationSchema.validate({ storyType, userId })
    if (error) {
        RemoveImage(req.file.filename);
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const GetFriendList = `SELECT f.approverId FROM friendList f WHERE userId = ? AND IsApproved = true AND IsClose = true`;

    connection.query(GetFriendList, [userId], async (err, result) => {
        if (err) {
            RemoveImage(req.file.filename);
            return res.status(400).json(CreateResponse(err.sqlMessage));
        }
        let AddStoryquery;
        let passData;
        const closeFriend = await result.map((item) => item.approverId);
        if (storyType == 'Private') {
            AddStoryquery = "INSERT INTO stories (StoriesId,creator,type,Image,createdAt,expireAt,closeFriendIds) VALUES(?,?,?,?,?,DATE_ADD(?, INTERVAL 24 HOUR),?)";
            passData = [uuidv4(), userId, 1, req.file.filename, formatDate(), formatDate(), JSON.stringify(closeFriend)]
        } else {
            AddStoryquery = "INSERT INTO stories (StoriesId,creator,type,Image,createdAt,expireAt) VALUES(?,?,?,?,?,DATE_ADD(?, INTERVAL 24 HOUR))";
            passData = [uuidv4(), userId, 0, req.file.filename, formatDate(), formatDate()]

        }
        connection.query(AddStoryquery, passData, async (err, result) => {
            if (err) {
                RemoveImage(req.file.filename);
                return res.status(400).json(CreateResponse(err.sqlMessage));
            }
            res.status(200).json(CreateResponse(null, null, "Story Created Successfully."));
        })
    })
};

export const GetUserStoriesController = (req, res) => {
    const userId = req?.user?.userId;

    const { error } = UserIDValidation.validate({ id: userId })
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const getStoryquery = "SELECT * FROM stories WHERE creator = ? ORDER BY createdAt desc";
    connection.query(getStoryquery, [userId], async (err, result) => {
        if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
        }
        result = result.map((item) => {
            item, item.Image = item.Image ? `/uploads/stories/${item.Image}` : null
            return item;
        })

        res.status(200).json(CreateResponse(null, result, "User Stories Fetched Successfully."));
    })
};

export const GetAllStoriesController = (req, res) => {
    const userId = req?.user?.userId;

    const { error } = UserIDValidation.validate({ id: userId })
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const GetAllStoryquery = `
    SELECT s.* FROM stories s
    WHERE s.type = 0 OR
    (s.type = 1 AND JSON_CONTAINS(s.closeFriendIds, JSON_QUOTE(?)) > 0)
    ORDER BY s.createdAt DESC
    LIMIT 15
`;
    connection.query(GetAllStoryquery, [userId], async (err, data) => {
        if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
        }

        data = data.map((item) => {
            item, item.Image = item.Image ? `/uploads/stories/${item.Image}` : null
            return item;
        })
        res.status(200).json(CreateResponse(null, data, "User Stories Fetched Successfully."));
    })
};

export const DeleteStoryController = (req, res) => {
    const userId = req?.user?.userId;
    const { storyId } = req.body;

    const { error } = deleteStoryValidationSchema.validate({ userId, storyId })
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const findStoryQuery = "SELECT * FROM stories WHERE StoriesId = ? AND creator = ?";

    const removeStoryquery = `
    DELETE FROM stories WHERE StoriesId = ? AND creator = ?
`;
    const passData = [storyId, userId];
    connection.query(findStoryQuery, passData, async (err, data) => {
        if (err) {
            return res.status(400).json(CreateResponse(err.sqlMessage));
        }
        if (data?.length == 0) {
            return res.status(400).json(CreateResponse("Story Does not exist"));
        }

        console.log('data :>> ', data);

        if (data[0].Image) {
            RemoveImage(data[0].Image);
        }
        connection.query(removeStoryquery, passData, async (err, result) => {
            if (err) {
                return res.status(400).json(CreateResponse(err.sqlMessage));
            }

            if (result.affectedRows > 0) {
                res.status(200).json(CreateResponse(null, null, "Story Deleted Successfully."));
            } else {
                return res.status(400).json(CreateResponse("Story Does not exist"));
            }
        })

    })
};

export const UpdateStoryController = (req, res) => {
    const { storyType, StoriesId } = req.body;
    const userId = req?.user?.userId;
    const { error } = updateStoryValidationSchema.validate({ storyType, userId, StoriesId })
    if (error) {
        RemoveImage(req.file.filename);
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }
    const findStoryQuery = "SELECT * FROM stories WHERE StoriesId = ? AND creator = ?";

    const updateToStoryQuery = "UPDATE stories SET Image = ?, type = ? WHERE StoriesId = ?";

    connection.query(findStoryQuery, [StoriesId, userId], async (err, result) => {
        if (err) {
            RemoveImage(req.file.filename);
            return res.status(400).json(CreateResponse(err.sqlMessage));
        }
        if (result.length == 0) {
            RemoveImage(req.file.filename);
            return res.status(400).json(CreateResponse('Story Does Not Exist'));
        }
        if (result[0].Image) {
            RemoveImage(result[0].Image)
        }

        connection.query(updateToStoryQuery, [req.file.filename, storyType == 'Public' ? 0 : 1, StoriesId], async (err, result) => {
            if (err) {
                RemoveImage(req.file.filename);
                return res.status(400).json(CreateResponse(err.sqlMessage));
            }
            res.status(200).json(CreateResponse(null, null, "Story Created Successfully."));
        })
    })
};