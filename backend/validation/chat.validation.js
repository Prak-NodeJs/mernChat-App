const Joi = require('joi')
const {objectId} = require('./custom.validation')

const createChat = {
    body: Joi.object()
      .keys({
       userId:Joi.string().required().custom(objectId)
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
      chatId:Joi.string().required().custom(objectId)
      }) 
  };

const removeUser = {
  body:Joi.object().keys({
    userId:Joi.string().required().custom(objectId),
    chatId:Joi.string().required().custom(objectId)
  })
}

const deleteChat = {
  params:Joi.object().keys({
    chatId:Joi.string().required().custom(objectId)
  })
}

const addUser = removeUser;


module.exports={
    createChat, createGroup,renameGroup, removeUser, addUser, deleteChat
}