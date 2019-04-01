'use strict';
/*---------------ACTOR----------------------*/
var mongoose = require('mongoose'),
  Actor = mongoose.model('Actor'),
  authController = require('./authController');

  var admin = require('firebase-admin');

exports.create_an_actor = function (req, res) {

  console.log(Date() + ": " + "POST /v1/actors");
  var new_actor = new Actor(req.body);

  new_actor.save(function (err, actor) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": " + "New actor with role: '" + actor.role + "' added.");
      res.status(201).send(actor);
    }
  });
};

exports.list_all_actors = function (req, res) {

  console.log(Date() + ": " + "GET /v1/actors/");

  Actor.find(function (err, actors) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": " + "All actors returned.");
      res.status(200).send(actors);
    }
  });
};

exports.read_an_actor = function (req, res) {

  console.log(Date() + ": " + "GET /v1/actors/:actorId");

  Actor.findById(req.params.actorId, function (err, actor) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": " + "Actor returned: '" + actor.name + actor.surname + ".");
      res.status(200).send(actor);
    }
  });
};

exports.update_an_actor_v1 = function (req, res) {

  console.log(Date() + ": " + "PUT /v1/actors/:"+ req.params.actorId);
  var actorId = req.params.actorId;
  //We must validate that the body is correct with our ActorSchema
  var actorUpdated = (req.body);

  Actor.findOneAndUpdate({ _id: actorId }, actorUpdated, { new: true }, function (err, actor) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    }
    else {
      console.log(Date() + ": " + "Actor updated: '" + actor.name +", "+ actor.surname + ".");
      res.status(200).send(actor);
    }
  });
};

exports.ban_an_actor = function (req, res) {

  console.log(Date() + ": " + "PUT /v1/actors/:actorId/ban");

  var actorToBanId = req.params.actorId;
  Actor.findById(actorToBanId, function (err, actorToBan) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    } else {
      if (actorToBan.role != "EXPLORER") {
        console.log(Date() + ": " + " WARNING. Trying to ban an actor with role: " + actorToBan.role + ".")
        res.sendStatus(403);
      } else {
        Actor.findOneAndUpdate({ _id: req.params.actorId }, { $set: { "banned": "true" } }, { new: true }, function (err, actor) {
          if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
          }
          else {
            console.log(Date() + ": " + "Actor with email: '" + actor.email + " is now banned.");
            res.status(200).send(actor);
          }
        });
      }
    }

  });
};

exports.unban_an_actor = function (req, res) {

  console.log(Date() + ": " + "PUT /v1/actors/:actorId/unban");

  var actorToUnBanId = req.params.actorId;
  Actor.findById(actorToUnBanId, function (err, actorToUnBanId) {
    if (err) {
      console.log(Date() + ": " + err);
      res.send(err);
    } else {
      if (actorToUnBanId.role != "EXPLORER") {
        console.log(Date() + ": " + " WARNING. Trying to unban an actor with role: " + actorToUnBanId.role + ".")
        res.sendStatus(403);
      } else {
        Actor.findOneAndUpdate({ _id: req.params.actorId }, { $set: { "banned": "false" } }, { new: true }, function (err, actor) {
          if (err) {
            console.log(Date() + ": " + err);
            res.send(err);
          }
          else {
            console.log(Date() + ": " + "Actor with email: '" + actor.email + " is now unbanned.");
            res.status(200).send(actor);
          }
        });
      }
    }

  });
};


exports.login_an_actor = async function(req, res) {
  console.log(Date()+': Starting loggin function');
  var emailParam = req.query.email;
  var password = req.query.password;
  Actor.findOne({ email: emailParam }, function (err, actor) {
      if (err) { res.send(err); }

      // No actor found with that email as username
      else if (!actor) {
        res.status(401); //an access token isn’t provided, or is invalid
        console.log(Date()+": There isn't any actor with this email:"+emailParam);
        res.json({message: 'forbidden',error: err});
      }

      //Validar si el usuario está baneado
      else if ((actor.banned)) {
        res.status(403); //an access token is valid, but requires more privileges
        console.log(Date()+": The actor "+actor.email+" is banned.");
        res.json({message: 'You are banned!',error: err});
      }
      else{
        // Make sure the password is correct
        //console.log('En actor Controller pass: '+password);
        //Usa el middleware del modelo del actor
        actor.verifyPassword(password, async function(err, isMatch) {
          if (err) {
            res.send(err);
          }

          // Password did not match
          else if (!isMatch) {
            //res.send(err);
            res.status(401); //an access token isn’t provided, or is invalid
            console.log(Date()+": The password is incorrect.");
            res.json({message: 'forbidden',error: err});
          }

          else {
              try{
                //Se crea custom token con el email del actor
                //Esperamos a que firebase nos de el custom token
                var customToken = await admin.auth().createCustomToken(actor.email);
              } catch (error){
                console.log("Error creating custom token:", error);
              }
              //Almaceno el customToken en el JSON de actor que le devuelvo al cliente
              actor.customToken = customToken;
              console.log(Date()+': Login Success. Sending JSON with custom token');
              res.json(actor);
          }
      });
    }
  });
};

/**------------------V2 METHODS---------------------- */

/**El usuario me pasa el idToken
 * Primero se busca el usuario por actorId
 */
exports.update_an_actor_v2 = function(req, res) {
  //Explorer and Manager can update theirselves, administrators can update any actor
  Actor.findById(req.params.actorId, async function(err, actor) {
    if (err){
      res.send(err);
    }
    else{
      var idToken = req.headers['idtoken'];//WE NEED the FireBase custom token in the req.header['idToken']... it is created by FireBase!!
      if (actor.role.includes('EXPLORER') || actor.role.includes('MANAGER') ||actor.role.includes('SPONSOR')){
        var authenticatedUserId = await authController.getUserId(idToken);
        //Si coincide el idToken de firebase con el actor que está intentando actualizar el perfil, se lo permito
        console.log(Date()+": ActorId checked with idToken: "+ authenticatedUserId);
        console.log(Date()+": ActorId by params:"+ req.params.actorId);
        if (authenticatedUserId == req.params.actorId){
          Actor.findOneAndUpdate({_id: req.params.actorId}, req.body, {new: true}, function(err, actor) {
            if (err){
              res.send(err);
            }
            else{
              console.log(Date()+": Actor succesfully updated.");
              res.json(actor);
            }
          });
        } else{
          res.status(403); //Auth error
          res.send('The Actor is trying to update an Actor that is not himself!');
        }    
        //Si es administrador tiene la capacidad de actualizar cualquier perfil
      } else if (actor.role.includes('ADMINISTRATOR')){
          Actor.findOneAndUpdate({_id: req.params.actorId}, req.body, {new: true}, function(err, actor) {
            if (err){
              res.send(err);
            }
            else{
              console.log(Date()+": Actor succesfully updated.");
              res.json(actor);
            }
          });
      } else {
        res.status(405); //Not allowed
        res.send('The Actor has unidentified roles');
      }
    }
  });

};

exports.list_all_actors_v2= function(req,res){}
exports.read_an_actor_v2= function(req,res){}
exports.ban_an_actor_v2= function(req,res){}
exports.unban_an_actor_v2= function(req,res){}
