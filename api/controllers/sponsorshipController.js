'use strict';

/*---------------SPONSORSHIP----------------------*/
var mongoose = require('mongoose'),
    Sponsorship = mongoose.model('Sponsorships');


exports.list_all_sponsorships = function (req, res) {

    console.log(Date() + ": " + "GET /v1/sponsorships");

    //Check if the user is a sponsor and only return their sponsorships

    Sponsorship.find(function (err, sponsorships) {
        if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
        } else {
            console.log(Date() + ": " + "All Sponsorships returned.");
            res.status(200).send(sponsorships);
        }
    });
};

exports.create_a_sponsorship = function (req, res) {

    console.log(Date() + ": " + "POST /v1/sponsorships");

    var new_sponsorship = new Sponsorship(req.body);

    new_sponsorship.save(function (err, sponsorship) {
        if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
        } else {
            console.log(Date() + ": " + "New Sponsorship with id:'" + sponsorship._id + "' created.");
            res.status(201).send(sponsorship);
        }
    });
}

exports.read_a_sponsorship = function (req, res) {
    //Check if the user is SPONSOR

    console.log(Date() + ": " + "GET /v1/sponsorships/:" + req.params.sponsorshipId);

    Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
        if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
        }
        else {
            console.log(Date() + ": " + "Sponsorship returned.");
            res.status(200).send(sponsorship);
        }
    });

}

exports.update_a_sponsorship = function (req, res) {
    //Check if the user is SPONSOR

    console.log(Date() + ": " + "PUT /v1/sponsorships/:" + req.params.sponsorshipId);
    var sponsorshipId = req.params.sponsorshipId;
    //We must validate that the body is correct with our Sponsorship
    var sponsorshipUpdated = (req.body);

    Sponsorship.findOneAndUpdate({ _id: sponsorshipId }, sponsorshipUpdated, { new: true }, function (err, sponsorship) {
        if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
        }
        else {
            console.log(Date() + ": " + "SponsorShip updated.");
            res.status(200).send(sponsorship);
        }
    });
}

exports.set_the_price = function (req, res) {
    //Check if the user is ADMINISTRATOR
    console.log(Date() + ": " + "PUT /v1/sponsorships/:sponsorshipsId/price");

    var sponsorShipToPriceId = req.params.sponsorshipsId;
    var sponsorShipPrice = req.body.price;
    Sponsorship.findById(sponsorShipToPriceId, function (err, sponsorShipToPrice) {
        if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
        } else {
            Sponsorship.findOneAndUpdate({ _id: req.params.sponsorshipsId }, { $set: { "price": sponsorShipPrice } }, { new: true }, function (err, sponsorship) {
                if (err) {
                    console.log(Date() + ": " + err);
                    res.send(err);
                }
                else {
                    console.log(Date() + ": " + "Sponsorship price settle to: "+ sponsorship.price);
                    res.status(200).send(sponsorship);
                }
            });
        }

    });
}

exports.delete_a_sponsorship = function (req, res) {

    console.log(Date() + ": " + "DELETE /v1/sponsorships/:" + req.params.sponsorshipId);

    //Check if the user is SPONSOR
    Sponsorship.deleteOne({ _id: req.params.sponsorshipId }, function (err, trip) {
        if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
        }
        else {
            res.json({ message: 'Sponsorship successfully deleted' });
        }
    });
}
