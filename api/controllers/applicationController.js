'use strict';


var mongoose = require('mongoose'),
Application = mongoose.model('Applications');

exports.list_all_applications = function(req, res) {
  Application.find({}, function(err, order) {
    if (err){
      res.send(err);
    }
    else{
      res.json(order);
    }
  });
};

exports.list_my_orders = function(req, res) {
  Application.find(function(err, orders) {
    if (err){
      res.send(err);
    }
    else{
      res.json(orders);
    }
  });
};

exports.search_user_applications = function(req, res) {
  //check if clerkId param exists
  //check if assigned param exists
  //check if delivered param exists
  //Search depending on params
  console.log('Searching orders depending on params');
  res.send('Applications returned from the orders search');
};


exports.create_an_application = function(req, res) {
  //Check that user is a Customer and if not: res.status(403); "an access token is valid, but requires more privileges"
  var new_order = new Application(req.body);

  new_order.save(function(error, order) {
    if (error){
      res.send(error);
    }
    else{
      res.json(order);
    }
  });
};


exports.read_an_application = function(req, res) {
  Application.findById(req.params.orderId, function(err, order) {
    if (err){
      res.send(err);
    }
    else{
      res.json(order);
    }
  });
};


exports.update_an_application = function(req, res) {
  //Check if the order has been previously assigned or not
  //Assign the order to the proper clerk that is requesting the assigment
  //when updating delivery moment it must be checked the clerk assignment and to check if it is the proper clerk and if not: res.status(403); "an access token is valid, but requires more privileges"
  Application.findById(req.params.orderId, function(err, order) {
      if (err){
        res.send(err);
      }
      else{
          Application.findOneAndUpdate({_id: req.params.orderId}, req.body, {new: true}, function(err, order) {
            if (err){
              res.send(err);
            }
            else{
              res.json(order);
            }
          });
        }
    });
};


exports.delete_an_order = function(req, res) {
  //Check if the order were delivered or not and delete it or not accordingly
  //Check if the user is the proper customer that posted the order and if not: res.status(403); "an access token is valid, but requires more privileges"
  Application.deleteOne({
    _id: req.params.orderId
  }, function(err, order) {
    if (err){
      res.send(err);
    }
    else{
      res.json({ message: 'Application successfully deleted' });
    }
  });
};
