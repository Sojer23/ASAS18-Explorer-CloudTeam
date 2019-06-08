'use strict';

/*---------------TRIP----------------------*/
var mongoose = require('mongoose'),
  Trip = mongoose.model('Trip'),
  Application = mongoose.model('Application');


exports.list_all_trips = function (req, res) {

  console.log(Date() + ": " + "GET /v1/trips");

  Trip.find({}, function (err, trips) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": Sending all trips.");
      res.status(200).json(trips);
    }
  });
};


exports.create_a_trip = function (req, res) {

  console.log(Date() + ": " + "POST /v1/trips");

  var new_trip = new Trip(req.body);

  new_trip.save(function (err, trip) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
      //console.log(err);
    }
    else {
      console.log(Date() + ": " + "Trip created.");
      res.status(201).json(trip);
    }
  });
};


exports.read_a_trip = function (req, res) {

  console.log(Date() + ": " + "GET /v1/trips/:tripID");
  Trip.findById(req.params.tripID, function (err, trip) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": " + " Sending trip.");
      res.status(200).json(trip);
    }
  });
};


exports.update_a_trip = function (req, res) {

  console.log(Date() + ": " + "PUT /v1/trips/:tripID");

  var tripToEditId = req.params.tripID;
  Trip.findById(tripToEditId, function (err, tripToEdit) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    } else {
      if (tripToEdit.status == "PUBLISHED") {
        console.log(Date() + ": " + " WARNING. Trying to edit a trip that is PUBLISHED");
        res.sendStatus(403);
      } else {
        Trip.findOneAndUpdate({ _id: req.params.tripID }, req.body, { new: true }, function (err, trip) {
          if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
          }
          else {
            console.log(Date() + ": " + " Trip updated.");
            res.status(200).json(trip);
          }
        });
      }
    }

  });
};

exports.delete_a_trip = function (req, res) {

  console.log(Date() + ": " + "DELETE /v1/trips/:tripID");

  var tripToDeleteId = req.params.tripID;
  Trip.findById(tripToDeleteId, function (err, tripToDelete) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    } else {
      if (tripToDelete.status == "PUBLISHED") {
        console.log(Date() + ": " + " WARNING. Trying to cancel a trip that is PUBLISHED");
        res.sendStatus(403);
      } else {
        Trip.deleteOne({ _id: req.params.tripID }, function (err, trip) {
          if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
          }
          else {
            console.log(Date() + ": " + " Trip deleted.");
            res.json({ message: 'Trip successfully deleted' });
          }
        });
      }
    }

  });
};

exports.cancel_a_trip = function (req, res) {

  console.log(Date() + ": " + "PUT /v1/trips/:tripID/cancel");

  var cancelledReason = req.body.cancelledReason;
  var tripToCancelId = req.params.tripID;

  if (!cancelledReason) {
    console.log(Date() + ": " + " WARNING. Trying to cancel a trip without cancelledReason");
    res.sendStatus(422);
  } else {
    Trip.findById(tripToCancelId, function (err, tripToCancel) {
      if (err) {
        console.log(Date() + ": " + err);
        res.send(err);
      } else {
        if (tripToCancel.status == "STARTED") {
          console.log(Date() + ": " + " WARNING. Trying to cancel a trip STARTED");
          res.sendStatus(403);
        } else {
          Application.find({ tripID: req.params.tripID, status: "ACCEPTED" }, function (err, data) {
            if (err) {
              console.log(Date() + ": " + err);
              res.send(err);
            } else {
              if (data.length != 0) {
                onsole.log(Date() + ": " + " WARNING. Trying to cancel a trip with accepted applications");
                res.sendStatus(403);
              } else {
                Trip.findOneAndUpdate({ _id: req.params.tripID },
                  { $set: { "status": "CANCELLED", "cancelledReason": cancelledReason } },
                  { new: true },
                  function (err, trip) {
                    if (err) {
                      console.log(Date() + ": " + err);
                      res.send(err);
                    }
                    else {
                      console.log(Date() + ": " + "Trip with ticker: '" + trip.ticker + "' is now cancelled.");
                      res.status(200).send(trip);
                    }
                  });
              }
            }
          });
        }
      }

    });
  }
};

exports.search_trips = function (req, res) {
  console.log(Date() + ": " + "GET /v1/trips/search");



  
  /**
   * PARAMETERS
   * - keyword
   */

  //Check if keyword param exists (keyword: req.query.keyword)
  //Search depending on params but only if deleted = false
  console.log('Searching an trip depending on params');
  res.send('Trip returned from the trip search');
};


/**-------V2 METHODS------------- */
exports.create_a_trip_v2 = function (req, res) { }
exports.read_a_trip_v2 = function (req, res) { }
exports.update_a_trip_v2 = function (req, res) { }
exports.delete_a_trip_v2 = function (req, res) { }
exports.cancel_a_trip_v2 = function (req, res) { }

// this solved the fucking issue
//exports.list_all_categories = function (req, res) {}
//exports.create_a_category = function (req, res) {}
//exports.read_a_category = function(req, res) {}

