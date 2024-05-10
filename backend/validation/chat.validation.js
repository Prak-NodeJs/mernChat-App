const Joi = require('joi')

const createChat = {
    body: Joi.object()
      .keys({
       userId:Joi.string().required()
      }) 
  };

  const createGroup = {
    body: Joi.object()
      .keys({
      chatName:Joi.string().required(),
      users:Joi.array().required().min(2)
      }) 
  };

  const renameGroup = {
    body: Joi.object()
      .keys({
      chatName:Joi.string().required(),
      chatId:Joi.string().required()
      }) 
  };

const removeUser = {
  body:Joi.object().keys({
    userId:Joi.string().required(),
    chatId:Joi.string().required()
  })
}

const addUser = removeUser;


module.exports={
    createChat, createGroup,renameGroup, removeUser, addUser
}