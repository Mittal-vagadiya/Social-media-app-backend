import Joi from "joi";

export const createCollectionSchema = Joi.object({
    collectionType: Joi.string().valid('Public', 'Private').required(),
    collectionName: Joi.string().required().messages({
        'string.empty': "Collection Name is required"
    }),
    collaborator: Joi.when('collectionType', {
        is: 'Public',
        then: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).min(1).unique().required().messages({
            'array.unique': "Collaborators must be unique",
            'string.uuid': "Each collaborator must be a valid UUID",
            'any.required': "Collaborators are required for Public collections"
        }),
        otherwise: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).unique().messages({
            'array.unique': "Collaborators must be unique",
            'string.uuid': "Each collaborator must be a valid UUID"
        })
    }),
    postId: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).unique().messages({
        'array.unique': "PostId must be unique",
        'string.uuid': "Each Post must be a valid UUID"
    }),
}, { abortEarly: false });


export const getCollectionSchema = Joi.object({
    userId: Joi.string().guid().required().messages({
        'string.guid': "User ID must be a valid UUID",
        'any.required': "User ID is required for user update"
    })
});

export const CollectionIdSchema = Joi.object({
    collectionId: Joi.string().guid().required().messages({
        'string.guid': "Collection ID must be a valid UUID",
        'any.required': "Collection ID is required for user update"
    })
});

export const updateCollectionSchema = Joi.object({
    collectionId: Joi.string().guid().required().messages({
        'string.guid': "Collection ID must be a valid UUID",
        'any.required': "Collection ID is required for user update"
    }),
    collectionType: Joi.string().valid('Public', 'Private').required(),
    collectionName: Joi.string().required().messages({
        'string.empty': "Collection Name is required"
    })
}, { abortEarly: false });

export const addPostToCollectionSchema = Joi.object({
    collectionId: Joi.string().guid().required().messages({
        'string.guid': "Collection ID must be a valid UUID",
        'any.required': "Collection ID is required for user update"
    }),
    postId: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).unique().messages({
        'array.unique': "Collaborators must be unique",
        'string.uuid': "Each collaborator must be a valid UUID"
    })
}, { abortEarly: false });
