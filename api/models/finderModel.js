'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  Actor = mongoose.model('Actor'),
  Trip = mongoose.model('Trip');

var FinderSchema = new Schema({
  keyword: {
    type: String,
    required: 'Keyword is required'
  },
  priceMin: {
    type: Number,
    required: 'princeMin is required',
    min: 0
  },
  priceMax: {
    type: Number,
    required: 'priceMax is required'
  },
  dateInit: {
    type: Date
  },
  dateEnd: {
    type: Date
  },
  explorerId: {
    type: Schema.Types.ObjectId,
    ref: "Actor",
    required: 'explorer actor id required'
  },
  //To save the result in caché 
  results: [Trip.schema]
}, { strict: false });



//Check if the explorer exists
FinderSchema.pre('save', function (next) {

  var new_finder = this;
  var explorer_id = new_finder.explorerId;

  if (explorer_id) {
    Actor.findOne({ _id: explorer_id }, function (err, res) {
      if (err) {
        next(err);
      } else {
        if (!res) {
          next(new Error("There is not any Explorer with id: " + explorer_id));
        } else {
          if (!(res.role === 'EXPLORER')) {
            next(new Error("The Explorer with id: " + explorer_id + " is not an EXPLORER Actor"));
          } else {
            next();
          }
        }
      }
    });
  }
});

//INDICES
//Búsqueda pasándole un keyword devuelve las búsquedas que lo contengan
FinderSchema.index({ keyword: "text" });

module.exports = mongoose.model('Finder', FinderSchema);