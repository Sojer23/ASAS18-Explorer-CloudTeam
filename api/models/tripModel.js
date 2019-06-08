'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  Actor = mongoose.model('Actor');

const generate = require('nanoid/generate');
const dateFormat = require('dateformat');



var StageSchema = new Schema({
  title: {
    type: String,
    required: 'Kindly enter the title of the stage'
  },
  description: {
    type: String,
    required: 'Kindly enter the description of the stage'
  },
  price: {
    type: Number,
    required: 'Kindly enter the price of the stage',
    min: 0
  },
  dateInit: {
    type: Date,
    required: 'Kindly enter the date of the stage'
  }
});

var CommentSchema = new Schema({
  title: {
    type: String,
    required: 'Kindly enter the title of the comment'
  },
  author: {
    type: String
  },
  commentText: {
    type: String,
    required: 'Kindly enter your comments'
  }
}, { strict: false });

var tripSchema = new Schema({
  ticker: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{6}-\w{4}/.test(v);
      },
      message: 'ticket is not valid, Pattern()'
    },
    unique: true
  },
  status: {
    type: String,
    required: true,
    default: 'CREATED',
    enum: ['PUBLISHED', 'CANCELLED', 'CREATED', 'STARTED', 'ENDED']
  },
  title: {
    type: String,
    required: 'Kindly enter the title of the trip'
  },
  description: {
    type: String,
    required: 'Kindly enter the description of the trip'
  },
  cancelledReason: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    min: 0
  },
  dateInit: {
    type: Date,
    required: 'Kindly enter the initial date of the trip'
  },
  dateEnd: {
    type: Date,
    validate: {
      validator: function (value) {
        return this.dateInit < value;
      },
      message: 'End date must be after start date'
    },
    required: 'Kindly enter the end date of the trip'
  },
  pictures: [
    {
      data: Buffer,
      contentType: String
    }
  ],
  stages: [StageSchema],
  comments: [CommentSchema],
  sponsorships: [{
    type: Schema.Types.ObjectId,
    ref: "Sponsorships"
  }],
  category: [{
    type: Schema.Types.ObjectId,
    ref: "Category"
  }],
  managerID: {
    type: Schema.Types.ObjectId,
    ref: "Actor",
    required: 'manager id required'
  },
  created: {
    type: Date,
    default: Date.now
  },

}, { strict: false });


// Execute before each trip.save() call
tripSchema.pre('save', function (next) {
  var new_trip = this;
  var day = dateFormat(new Date(), "yymmdd");

  var generated_ticker = [day, generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)].join('-')
  new_trip.ticker = generated_ticker;
  next();
});

//Execute the sum of the price before each save
tripSchema.pre('save', function (next) {
  var new_trip = this;

  //Set the price field to 0
  new_trip.price = 0;

  //Compute the total price
  new_trip.stages.forEach(e => {
    new_trip.price += e.price
  });
  next();
});

tripSchema.pre('findOneAndUpdate', function (next) {
  if (this._update['$set'].status == "CANCELLED") {
    console.log(Date()+": Changing trip status to CANCELLED.");
    next();
  } else {
    var stages_price = this._update.stages.map((stage) => stage.price);
    var totalPrice = stages_price.reduce((a, b) => a + b, 0);
    this.update({}, { $set: { price: totalPrice } });
    next();
  }
});

//Check if the author is an MANAGER
tripSchema.pre('save', function (next) {

  var new_trip = this;
  var manager_id = new_trip.managerID;

  if (manager_id) {
    Actor.findOne({ _id: manager_id }, function (err, res) {
      if (err) {
        next(err);
      } else {
        if (!res) {
          next(new Error("There is not any Manager with id: " + manager_id));
        } else {
          if (!(res.role === 'MANAGER')) {
            next(new Error("The Actor with id: " + manager_id + " is not an MANAGER Actor"));
          } else {
            next();
          }
        }
      }
    });
  }
});

//INDICES

tripSchema.index({price:1});
tripSchema.index({title: 'text', description: 'text', ticker: 'text'});
StageSchema.index({price:1});
StageSchema.index({title: 'text', description: 'text'});

tripSchema.index({ category: 1, price: 1 }); //1 ascending,  -1 descending
//Búsqueda por precio de forma ascendente
tripSchema.index({ price: 1 });
//Índice para la búsqueda de trips por keyword
tripSchema.index({ title: 'text', description: 'text', ticker: 'text' });

module.exports = mongoose.model('Trip', tripSchema);
module.exports = mongoose.model('Stage', StageSchema);



