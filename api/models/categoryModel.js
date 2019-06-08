'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    Trip = mongoose.model('Trip');


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
    tripID:{
        type: Schema.Types.ObjectId,
        ref: "Trip",
        required: 'trip id required'
      },
  }, { strict: false });


  //Check if the trip exists
  // CategorySchema.pre('save', function(next){

  //   var new_category = this;
  //   var trip_id = new_category.tripID;
  
  //   if(trip_id){
  //     Trip.findOne({_id:trip_id}, function(err, res){
  //         if(err){
  //           next(err);
  //         }else{
  //           if(!res){
  //             next(new Error("There is not any trip with id: "+ trip_id));
  //           }else{           
  //               next();
  //           }
  //         }
  //     });
  //   }
  // });
  
  
  module.exports = mongoose.model('Category', CategorySchema);