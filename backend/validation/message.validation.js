const Joi = require('joi')

const createMessage = {
    body: Joi.object()
      .keys({
        content: Joi.string(),
        chatId: Joi.string().required(),
       file:Joi.string(),
      }) 
  };

const fetchMessage = {
    params: Joi.object()
      .keys({
       chatId:Joi.string().required()
      }) 
  };

  const messageEdit= {
    params: Joi.object()
    .keys({
     msgId:Joi.string().required()
    }) ,
    body: Joi.object()
      .keys({
       content:Joi.string().required()
      }) 
  };

module.exports={
    createMessage, fetchMessage,messageEdit
}