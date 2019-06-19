'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CategorySchema = new Schema({
    name: {
      type: String,
      required: 'Kindly enter the name of the Category'
    },
    description: {
      type: String,
      required: 'Kindly enter the description of the Category'
    },
    picture: {
      data: Buffer, contentType: String
    },
    created: {
      type: Date,
      default: Date.now
    },
  }, { strict: false });  
 

    //INDICES
  //Búsqueda pasándole un keyword devuelve las búsquedas que lo contengan
  CategorySchema.index({ name: "text", description:"text" });

  
  module.exports = mongoose.model('Category', CategorySchema);