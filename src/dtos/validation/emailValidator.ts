import Joi from "joi";

export const emailValidation = (email: string) => {
  const schema: Joi.ObjectSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }),
  });
  const { value, error } = schema.validate({
    email: email,
  });
  return { value, error };
};
