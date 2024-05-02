import Joi from "joi";

export const LoginUserValdations = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': "Email is required",
    'string.email': "Email must be a valid email address"
  }),
  password: Joi.string().min(4).max(10).required().messages({
    'string.empty': "password is required",
    'string.min': "Password must be at least 4 characters long",
    'string.max': "Password cannot be more than 10 characters long"
  }),
}, { abortEarly: false });


export const RegisterUserValdations = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': "Email is required",
    'string.email': "Email must be a valid email address"
  }),
  password: Joi.string().min(4).max(10).required().messages({
    'string.empty': "Password is required",
    'string.min': "Password must be at least 4 characters long",
    'string.max': "Password cannot be more than 10 characters long"
  }),
  userName: Joi.string().min(3).max(15).required().messages({
    'string.empty': "Username is required",
    'string.min': "Username must be at least 3 characters long",
    'string.max': "Username cannot be more than 15 characters long"
  }),
}, { abortEarly: false });


export const ResetPasswordValdations = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': "Email is required",
    'string.email': "Email must be a valid email address"
  }),
  newPassword: Joi.string().min(4).max(10).required().messages({
    'string.empty': "password is required",
    'string.min': "Password must be at least 4 characters long",
    'string.max': "Password cannot be more than 10 characters long"
  }),
}, { abortEarly: false });
