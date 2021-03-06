'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    Actor = mongoose.model('Actor');

//SponsorshipSchema
var SponsorshipSchema = new Schema({
    sponsorId:{
      type: Schema.Types.ObjectId,
      ref: "Actor",
      required: 'sponsor actor id required'
    },
    banner:{
      data: Buffer, 
      contentType: String
    },
    link:{
      type: String,
      required: 'Link is required'
    },
    paid:{
      type: Boolean,
      default: false,
      required: 'Paid status is required'
    }
  }, { strict: false });
  


//Check if the author is an MANAGER
SponsorshipSchema.pre('save', function(next){

  var new_sponsorship = this;
  var sponsor_id = new_sponsorship.sponsorId;

  if(sponsor_id){
    Actor.findOne({_id:sponsor_id}, function(err, res){
        if(err){
          next(err);
        }else{
          if(!res){
            next(new Error("There is not any Sponsor with id: "+ sponsor_id));
          }else{
            if(!(res.role === 'SPONSOR')){
              next(new Error("The Actor with id: "+ sponsor_id+" is not an SPONSOR Actor"));
            }else{
              next();
            }
          }
        }
    });
  }
});  

//Check if the trip exists
SponsorshipSchema.pre('save', function(next){

  var new_sponsorship = this;
  var trip_id = new_sponsorship.tripId;

  if(trip_id){
    Trip.findOne({_id:trip_id}, function(err, res){
        if(err){
          next(err);
        }else{
          if(!res){
            next(new Error("There is not any trip with id: "+ trip_id));
          }else{           
              next();
          }
        }
    });
  }
});

//INDICES
//Devuelve los sposorships que están pagados, ordenados
SponsorshipSchema.index({sponsorId: 1, paid: 1});

module.exports = mongoose.model('Sponsorship', SponsorshipSchema);
