import Joi from "joi";

export const ArchiveIdValidation = Joi.object({
    archiveId: Joi.string().guid().required().messages({
        'error.empty': "Archive ID is missing."
    })
});

export const deleteArchiveSchemaValidation = ArchiveIdValidation.keys({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User ID must be a valid UUID",
        'any.required': "User ID is required for user update"
    })
}).options({ abortEarly: false });

export const AddArchiveSchemaValidation = Joi.object({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User ID must be a valid UUID",
        'any.required': "User ID is required for user update"
    }),
    postId: Joi.array()
}).options({ abortEarly: false });