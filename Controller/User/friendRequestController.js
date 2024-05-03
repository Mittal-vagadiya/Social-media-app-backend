import { connection } from "../../Connection/dbConnection.js";
import { v4 as uuidv4 } from "uuid";
import { CreateResponse } from "../../helper.js";
import { AddtoBlockFriendListSchema, AddtoCloseFriendRequestSchema, ApproveFriendRequestSchema, ApproverIdSchemaValidation, sendFriendRequestSchema } from "../../Validations/friendListValidation.js";
import { UserIDValidation } from "../../Validations/userValidations.js";

export const SendFriendRequestController = (req, res) => {
    const { approverId } = req.body;
    const userId = req?.user?.userId;

    const { error } = sendFriendRequestSchema.validate(({ approverId, userId }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    if (approverId === userId) {
        return res.status(403).json(CreateResponse('UserId and ApproverId can not be same'));
    }

    const checkRequestExistQuery = 'SELECT * FROM friendList WHERE userId = ? AND approverId = ?'
    const sendRequestQuery =
        "INSERT INTO friendList (requestId,approverId,userId) VALUES(?,?,?)";

    const requestId = uuidv4();

    connection.query(checkRequestExistQuery, [userId, approverId], (err, data) => {
        if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        if (data.length !== 0) {
            return res
                .status(400)
                .json(CreateResponse("Friend request already sent. Please wait for user to approve."));

        }
        connection.query(sendRequestQuery, [requestId, approverId, userId], (err, data) => {
            if (err) return res.status(400).json(CreateResponse(err.sqlMessage));

            return res
                .status(200)
                .json(CreateResponse(null, null, "Request Sended SuccessFully!"));
        })
    });
};

export const UpdateFriendRequestController = (req, res) => {

    const { requestId, IsApproved } = req.body;
    const approverId = req?.user?.userId;

    const { error } = ApproveFriendRequestSchema.validate(({ ...req.body, approverId }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const checkRequestExistQuery = 'SELECT * FROM friendList WHERE requestId = ? AND approverId = ?'

    connection.query(checkRequestExistQuery, [requestId, approverId], (err, data) => {
        if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        if (data.length === 0) {
            return res
                .status(400)
                .json(CreateResponse("Request does not Exist. Please send Request Again."));
        }

        let RequestQuery;
        let passData;

        if (IsApproved) {
            RequestQuery = `UPDATE friendList SET IsApproved = ? WHERE approverId = ? AND requestId = ?;`;
            passData = [IsApproved, approverId, requestId];
        } else {
            RequestQuery = `Delete FROM friendList WHERE approverId = ? AND requestId = ?;`;
            passData = [approverId, requestId]
        }

        connection.query(RequestQuery, passData, (err, data) => {
            if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
            return res
                .status(200)
                .json(CreateResponse(null, null, "Request Updated SuccessFully!"));
        })
    });
};

export const GetFriendRequestController = (req, res) => {

    const approverId = req?.user?.userId;
    const { error } = ApproverIdSchemaValidation.validate(({ approverId }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const checkReqeusExistQuery = `SELECT f.*,(SELECT JSON_OBJECT(
        'userId', u.userId,
        'profileImage', u.profileImage,
        'bio',u.bio,
        'userName',u.userName
      ) FROM user u WHERE u.userId = f.userId) AS userDetails
    FROM friendList f WHERE approverId = ? AND IsApproved = false`;

    connection.query(checkReqeusExistQuery, [approverId], (err, data) => {
        if (err) return res.status(400).json(CreateResponse(err.sqlMessage));

        data.forEach((item) => {
            item.userDetails = JSON.parse(item.userDetails)
        })
        return res
            .status(400)
            .json(CreateResponse(null, data, 'Requests Get Successfully'));
    });
};

export const GetFriendListController = (req, res) => {
    const userId = req?.user?.userId;

    const { error } = UserIDValidation.validate(({ id: userId }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const GetFriendList = `SELECT *,(SELECT JSON_OBJECT(
        'userId', u.userId,
        'profileImage', u.profileImage,
        'bio',u.bio,
        'userName',u.userName
      ) FROM user u WHERE u.userId = f.approverId) AS userDetails FROM friendList f WHERE userId = ? AND IsApproved = true`;

    connection.query(GetFriendList, [userId], (err, data) => {
        if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        if (data.length !== 0) {
            data.forEach((item) => {
                item.userDetails = JSON.parse(item.userDetails)
            })
            return res
                .status(200)
                .json(CreateResponse(null, data, "Friends List fetched Successfully!"));

        }
    });
};

export const AddToCloseFriendRequestController = async (req, res) => {
    const { friendIds } = req.body;
    const userId = req?.user?.userId;

    const { error } = AddtoCloseFriendRequestSchema.validate(({ userId, friendIds }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    if (friendIds.includes(userId)) {
        return res.status(403).json(CreateResponse('Friends List can not Contain User Id'));
    }

    const updateCloseFriendQuery = 'UPDATE friendList SET isClose = true WHERE userId = ? AND approverId = ? AND IsApproved = true';

    // Update the isClose field to true for each friendId
    for (let friendId of friendIds) {
        await connection.query(updateCloseFriendQuery, [userId, friendId], (err, data) => {
            if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        });
    }

    return res
        .status(200)
        .json(CreateResponse(null, null, "Users Added to Close Friend List SuccessFully!"));

};

export const GetCloseFriendsListController = (req, res) => {
    const userId = req?.user?.userId;

    const { error } = UserIDValidation.validate(({ id: userId }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const GetFriendList = `SELECT *,(SELECT JSON_OBJECT(
        'userId', u.userId,
        'profileImage', u.profileImage,
        'bio',u.bio,
        'userName',u.userName
      ) FROM user u WHERE u.userId = f.approverId) AS userDetails FROM friendList f WHERE userId = ? AND IsApproved = true AND IsClose = true`;

    connection.query(GetFriendList, [userId], (err, data) => {
        if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        if (data.length !== 0) {
            data.forEach((item) => {
                item.userDetails = JSON.parse(item.userDetails)
            })
            return res
                .status(200)
                .json(CreateResponse(null, data, "Close Friends List fetched Successfully!"));

        }
    });
};

export const RemoveFromCloseFriendRequestController = async (req, res) => {
    const { friendIds } = req.body;
    const userId = req?.user?.userId;

    const { error } = AddtoCloseFriendRequestSchema.validate(({ userId, friendIds }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    if (friendIds.includes(userId)) {
        return res.status(403).json(CreateResponse('Friends List can not Contain User Id'));
    }

    const updateCloseFriendQuery = 'UPDATE friendList SET isClose = false WHERE userId = ? AND approverId = ? AND IsApproved = true';

    // Update the isClose field to true for each friendId
    for (let friendId of friendIds) {
        await connection.query(updateCloseFriendQuery, [userId, friendId], (err, data) => {
            if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        });
    }

    return res
        .status(200)
        .json(CreateResponse(null, null, "Users Removed FROM Close Friend List SuccessFully."));

};

export const AddToBlockListController = async (req, res) => {
    const { blockIds } = req.body;
    const userId = req?.user?.userId;

    const { error } = AddtoBlockFriendListSchema.validate(({ userId, blockIds }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    if (blockIds.includes(userId)) {
        return res.status(403).json(CreateResponse('Block User List can not Contain User Id'));
    }

    const updateCloseFriendQuery = 'UPDATE friendList SET IsBlocked = true WHERE userId = ? AND approverId = ? AND IsApproved = true';

    // Update the isClose field to true for each friendId
    for (let friendId of blockIds) {
        await connection.query(updateCloseFriendQuery, [userId, friendId], (err, data) => {
            if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        });
    }

    return res
        .status(200)
        .json(CreateResponse(null, null, "Users Added to Block List SuccessFully!"));
};

export const GetBlockedFriendsListController = (req, res) => {
    const userId = req?.user?.userId;

    const { error } = UserIDValidation.validate(({ id: userId }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    const GetFriendList = `SELECT *,(SELECT JSON_OBJECT(
        'userId', u.userId,
        'profileImage', u.profileImage,
        'bio',u.bio,
        'userName',u.userName
      ) FROM user u WHERE u.userId = f.approverId) AS userDetails FROM friendList f WHERE userId = ? AND IsApproved = true AND IsBlocked = true`;

    connection.query(GetFriendList, [userId], (err, data) => {
        if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        if (data.length !== 0) {
            data.forEach((item) => {
                item.userDetails = JSON.parse(item.userDetails)
            })
            return res
                .status(200)
                .json(CreateResponse(null, data, "Blocked Friends List fetched Successfully!"));

        }
    });
};

export const RemoveFromBlockFriendRequestController = async (req, res) => {
    const { blockIds } = req.body;
    const userId = req?.user?.userId;

    const { error } = AddtoBlockFriendListSchema.validate(({ userId, blockIds }));
    if (error) {
        return res.status(403).json(CreateResponse(error.details.map((item) => item.message)))
    }

    if (blockIds.includes(userId)) {
        return res.status(403).json(CreateResponse('Blocked List can not Contain current user User Id'));
    }

    const updateCloseFriendQuery = 'UPDATE friendList SET IsBlocked = false WHERE userId = ? AND approverId = ? AND IsApproved = true';

    // Update the isClose field to true for each friendId
    for (let blockId of blockIds) {
        await connection.query(updateCloseFriendQuery, [userId, blockId], (err, data) => {
            if (err) return res.status(400).json(CreateResponse(err.sqlMessage));
        });
    }

    return res
        .status(200)
        .json(CreateResponse(null, null, "Users Removed FROM Blocked Friend List."));

};
