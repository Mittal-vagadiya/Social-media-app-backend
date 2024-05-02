import Joi from "joi";

export const FavourtiesIdValidation = Joi.object({
    favouritesId: Joi.string().guid().required().messages({
        'error.empty': "Favourite ID is missing."
    })
});

export const deleteFavouriteSchemaValidation = FavourtiesIdValidation.keys({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User ID must be a valid UUID",
        'any.required': "User ID is required for user update"
    })
});

export const AddFavourtieSchemaValidation = Joi.object({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User ID must be a valid UUID",
        'any.required': "User ID is required for user update"
    }),
    postId: Joi.array()
}).options({ abortEarly: false });