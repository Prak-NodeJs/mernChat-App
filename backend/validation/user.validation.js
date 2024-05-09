const Joi = require('joi')

const createUser = {
    body: Joi.object()
      .keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password:Joi.string().required(),
        file:Joi.string()
      }) 
  };

const validateUserLogin = {
    body: Joi.object()
      .keys({
        email: Joi.string().required().email(),
        password:Joi.string().required()
      }) 
  };

module.exports={
    createUser, validateUserLogin
}