import Joi from "joi";

export const createStoryValidationSchema = Joi.object({
    storyType: Joi.string().valid('Public', 'Private').required().messages({
        'string.empty': `Story type cannot be an empty field`,
        'any.required': `Story type is a required field`
    }),
    userId: Joi.string().guid().required().messages({
        'string.guid': "User Id must be a valid UUID",
        'any.required': "User Id is required for user update"
    }),
}, { abortEarly: false })


export const deleteStoryValidationSchema = Joi.object({
    storyId: Joi.string().guid().required().messages({
        'string.guid': "User Id must be a valid UUID",
        'any.required': "User Id is required for user update"
    }),
    userId: Joi.string().guid().required().messages({
        'string.guid': "User Id must be a valid UUID",
        'any.required': "User Id is required for user update"
    }),
}, { abortEarly: false })


export const updateStoryValidationSchema = Joi.object({
    storyType: Joi.string().valid('Public', 'Private').required().messages({
        'string.empty': `Story type cannot be an empty field`,
        'any.required': `Story type is a required field`
    }),
    userId: Joi.string().guid().required().messages({
        'string.guid': "User Id must be a valid UUID",
        'any.required': "User Id is required for user update"
    }),
    StoriesId: Joi.string().guid().required().messages({
        'string.guid': "Story Id must be a valid UUID",
        'any.required': "Story Id is required for user update"
    })
}, { abortEarly: false })