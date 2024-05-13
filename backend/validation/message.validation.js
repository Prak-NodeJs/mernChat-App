const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMessage = {
    body: Joi.object()
      .keys({
        content: Joi.string(),
        chatId: Joi.string().required().custom(objectId),
       file:Joi.string(),
      }) 
  };

const fetchMessage = {
    params: Joi.object()
      .keys({
       chatId:Joi.string().required().custom(objectId)
      }) 
  };

  const messageEdit= {
    params: Joi.object()
    .keys({
     msgId:Joi.string().required().custom(objectId)
    }) ,
    body: Joi.object()
      .keys({
       content:Joi.string().required()
      }) 
  };

  const messageDelete= {
    params: Joi.object()
    .keys({
     msgId:Joi.string().required().custom(objectId)
    }) 
  };


const replyMessage = {
  body: Joi.object()
    .keys({
      content: Joi.string(),
      chatId: Joi.string().required().custom(objectId),
      file:Joi.string(),
    }) 
};

module.exports={
    createMessage, fetchMessage,messageEdit, messageDelete, replyMessage
}