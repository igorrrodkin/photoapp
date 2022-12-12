import Joi from 'joi';
import { authClients } from '../interfaces.js';

export const registrationClientsValidation = (body: authClients) => {
  const schema: Joi.ObjectSchema = Joi.object({
    login: Joi.string().alphanum().min(8).max(20).required(),
    password: Joi.string().alphanum().min(8).max(20).required(),
  });
  const { value, error } = schema.validate({
    login: body.login,
    password: body.password,
  });
  return { value, error };
};
