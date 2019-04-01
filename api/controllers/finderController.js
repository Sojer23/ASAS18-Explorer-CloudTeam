'use strict';

/*---------------FINDER----------------------*/
var mongoose = require('mongoose'),
  Finder = mongoose.model('Finder'),
  Trip = mongoose.model('Trip'),
  globalConfig = mongoose.model('globalConfig');

exports.post_a_finder = function (req, res) {

  console.log(Date() + ": " + "POST /v1/finders");

  var new_finder = new Finder(req.body);

  getTripsOfFinder(new_finder).then(trips => {
    if (trips.length == 0) {
      console.log(Date() + ": There isn't any trip with this search criteia.");
      new_finder.save(function (err, finder) {
        if (err) {
          console.log(Date() + ":" + err);
          res.send(err);
        } else {
          res.status(201).json(finder);
        }
      });
    } else {
      new_finder.results = trips;
      new_finder.save(function (err, finder) {
        if (err) {
          console.log(Date() + ":" + err);
          res.send(err);
        } else {
          res.status(201).json(finder);
        }
      });
    }
  });
}


exports.list_all_finders = function (req, res) {
  console.log(Date() + ": " + "GET /v1/finders");

  Finder.find({}, function (err, finders) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": Sending all finders.");
      res.status(200).json(finders);
    }
  });
}


exports.read_a_finder = function (req, res) {
  console.log(Date() + ": " + "GET /v1/finders/:finderId");
  Finder.findById(req.params.finderId, function (err, finder) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": " + " Sending finder.");
      res.status(200).json(finder);
    }
  });
};

exports.update_a_finder = function (req, res) {
  //Check that the user is administrator if it is updating more things than comments and if not: res.status(403); "an access token is valid, but requires more privileges"
  console.log(Date() + ": " + "PUT /v1/finders/:finderId");

  Finder.findOneAndUpdate({ _id: req.params.finderId }, req.body, { new: true }, function (err, finderUpdated) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": " + " Finder updated.");
      res.status(200).json(finderUpdated);
    }
  });
};


function getTripsOfFinder(finder) {

  //Finder properties
  var dateInit = finder.dateInit;
  var dateEnd = finder.dateEnd;
  var priceMin = finder.priceMax;
  var priceMax = finder.priceMin;
  var keyword = finder.keyword;

  //Create query
  var query = {};
  if (dateInit || dateEnd) {
    query.dateInit = {};
    query.dateEnd = {};
    if(dateInit){
      query.dateInit.$gte = dateInit;
      query.dateEnd.$gte = dateInit;
    }else{
      query.dateInit.$lte = dateEnd;
      query.dateEnd.$lte = dateEnd;
    }
    
  
  }
  if (priceMin || priceMax) {
    query.price = {};
    query.price.$gte = priceMax;
    query.price.$lte = priceMin;
  }
  if (keyword) {
    query.$text = { $search: keyword };
  }
  console.log(Date() + ": Query to execute: " + JSON.stringify(query));

  return new Promise((res, rej) => {
    //First we must take max of results to cache from globalConfig
    globalConfig.findOne(function (err, config) {
      if (err) {
        console.log(Date() + ": " + err);
        rej(err);
      } else {
        var resultsLimit = config.finderResults;
        console.log(Date() + ": Limit of results: " + resultsLimit);
        Trip.find(query).limit(resultsLimit).exec(function (err, trips) {
          if (err) {
            console.log(Date() + ": " + err);
            rej(err);
          } else {
            res(trips);
          }
        });
      }
    });


  });


}



/**--------V2 METHODS---------------- */

exports.list_all_finders_v2 = function (req, res) { };
exports.post_a_finder_v2 = function (req, res) { };
exports.read_a_finder_v2 = function (req, res) { };
exports.update_a_finder_v2 = function (req, res) { };




