'use strict';
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var ActorSchema = new Schema({
  name: {
    type: String,
    required: 'Kindly enter the actor name'
  },
  surname: {
    type: String,
    required: 'Kindly enter the actor surname'
  },
  email: {
    type: String,
    unique: true,
    required: 'Kindly enter the actor email',
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  password: {
    type: String,
    minlength: 5,
    required: 'Kindly enter the actor password'
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  role: {
    type: String,
    required: 'Kindly enter the user role',
    enum: ['EXPLORER', 'MANAGER', 'ADMINISTRATOR', 'SPONSOR']
  },
  banned: {
    type: Boolean,
    default: false
  },
  flatRatePaid: {
    type: Boolean,
    default: false
  },
  customToken: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
}, { strict: false });


//Controlar si la contraseña se ha modificado y volver a hashearla
ActorSchema.pre('save', function (callback) {
  var actor = this;

  // Sale si la contraseña no ha cambiado
  if (!actor.isModified('password')) {
    return callback();
  }

  // Si la contraseña ha cambiado la hasheamos
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return callback(err);

    bcrypt.hash(actor.password, salt, function (err, hash) {
      if (err) return callback(err);
      actor.password = hash;
      callback();
    });
  });
});

//Controlar si la contraseña viene hasheada
ActorSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    console.log(Date() + ': Verifying password in ActorModel');
    if (err) return cb(err);
    console.log(Date()+': ¿Is match?: ' + isMatch);
    cb(null, isMatch);
  });
};


//INDICES


module.exports = mongoose.model('Actor', ActorSchema);
