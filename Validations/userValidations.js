import Joi from "joi";

export const UserIDValidation = Joi.object({
    id: Joi.string().guid().required().messages({
        'error.empty': "UserID is missing. Please Login to Continue"
     })
});

export const userSchemaValdation = Joi.object({
    userName: Joi.string().min(3).max(30).required().messages({
      'string.empty': "Username is required",
      'string.min': "Username must be at least 3 characters long",
      'string.max': "Username cannot exceed 30 characters"
    }),
    email: Joi.string().email().required().messages({
      'string.empty': "Email is required",
      'string.email': "Email must be a valid email address"
    }),
    password: Joi.string().min(6).max(30).required().messages({
      'string.empty': "Password is required",
      'string.min': "Password must be at least 6 characters long",
      'string.max': "Password cannot exceed 30 characters"
    }),
    bio: Joi.string().min(3).max(250).optional().messages({
      'string.max': "Bio cannot exceed 250 characters",
      'string.min': "Bio can have atleast 3 characters"
    }),
    age: Joi.number().integer().min(18).max(120).required().messages({
      'number.base': "Age must be a number",
      'number.integer': "Age must be an integer",
      'number.min': "Age must be at least 18",
      'number.max': "Age cannot exceed 120"
    })
  }).options({ abortEarly: false });


export const updateUserSchemaValidation = userSchemaValdation.keys({
    userId: Joi.string().guid().required().messages({ // Add userId to updateUserSchemaValidation and make it required
        'string.guid': "UserId must be a valid UUID",
        'any.required': "UserId is required for user update"
    })
});


export const followerUserSchemaValidation = UserIDValidation.keys({
    follower: Joi.string().guid().required().messages({ // Add userId to updateUserSchemaValidation and make it required
        'string.guid': "Follower Id must be a valid UUID",
        'any.required': "Follower Id is required for user update"
    })
});




