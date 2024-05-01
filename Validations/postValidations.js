import Joi from "joi";
import { UserIDValidation } from "./userValidations.js";

export const PostIDValidation = Joi.object({
    id: Joi.string().guid().required().messages({
        'error.empty': "Post ID is missing."
     })
});

export const postSchemaValidation = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
        'string.empty': "Title is required",
        'string.min': "Title must be at least 3 characters long",
        'string.max': "Title cannot exceed 100 characters"
    }),
    content: Joi.string().min(10).max(5000).required().messages({
        'string.empty': "Content is required",
        'string.min': "Content must be at least 10 characters long",
        'string.max': "Content cannot exceed 5000 characters"
    }),
    imageUrl: Joi.string().uri().allow('').optional().messages({
        'string.uri': "ImageUrl must be a valid URI"
    })
}).options({ abortEarly: false });

export const updatePostSchemaValidation = postSchemaValidation.keys({
    postId: Joi.string().guid().required().messages({ // Add userId to updateUserSchemaValidation and make it required
        'string.guid': "PostID must be a valid UUID",
        'any.required': "PostID is required for user update"
    })
});

export const LikePostSchemaValidation = UserIDValidation.keys({
    postId: Joi.string().guid().required().messages({ // Add userId to updateUserSchemaValidation and make it required
        'string.guid': "PostID must be a valid UUID",
        'any.required': "PostID is required for user update"
    })
});

export const querySchema = Joi.object({
    orderBy: Joi.string().valid('New to old', 'Old to new'),
    filterPeriod: Joi.string().valid('pastWeek', 'pastMonth', 'pastYear', 'dateRange'),
    startDate: Joi.date().iso().when('filterPeriod', {
        is: 'dateRange',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    endDate: Joi.date().iso().when('filterPeriod', {
        is: 'dateRange',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    AuthorId: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
    )
}).options({ abortEarly: false });