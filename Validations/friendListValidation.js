import Joi from "joi";

export const ApproverIdSchemaValidation = Joi.object({
    approverId: Joi.string().guid().required().messages({
        'string.guid': "Approver ID must be a valid UUID",
        'any.required': "Approver ID is required for Friend List."
    })
});

export const sendFriendRequestSchema = ApproverIdSchemaValidation.keys({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User Id must be a valid UUID",
        'any.required': "User Id is required for user update"
    })
}, { abortEarly: false });


export const ApproveFriendRequestSchema = ApproverIdSchemaValidation.keys({
    requestId: Joi.string().guid().required().messages({
        'string.guid': "Request ID must be a valid UUID",
        'any.required': "Request ID is required for Friend List"
    }),
    IsApproved: Joi.boolean().required().messages({
        'any.required': "Approve field required"
    })
}, { abortEarly: false });


export const AddtoCloseFriendRequestSchema = Joi.object({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User Id must be a valid UUID",
        'any.required': "User Id is required for user update"
    }),
    friendIds: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).min(1).unique().required().messages({
        'array.unique': "Ids of user you want to Add to Close Friend must be unique",
        'string.uuid': "Ids of users you want to Add to Close Friend  must be valid UUID",
        'any.required': "Ids of users you want to Add to Close Friend are required for Adding to close Friend List"
    })
}, { abortEarly: false });

export const AddtoBlockFriendListSchema = Joi.object({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User Id must be a valid UUID",
        'any.required': "User Id is required for user update"
    }),
    blockIds: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).min(1).unique().required().messages({
        'array.unique': "Ids of user you want to block must be unique",
        'string.uuid': "Ids of users you want to block must be valid UUID",
        'any.required': "Ids of users you want to block are required for Adding to close Friend List"
    })
}, { abortEarly: false });