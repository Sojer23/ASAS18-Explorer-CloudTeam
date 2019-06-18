'use strict';

/*---------------CATEGORY----------------------*/
var mongoose = require('mongoose'),
  Category = mongoose.model('Category');
  

exports.list_all_categories = function(req, res) {

  Category.find({}, function(err, category) {
    if (err){
      console.log(Date() + ": " + err)
      res.send(err);
    } else {
      console.log(Date() + ": Sending all categories")
      res.status(200).send(category);
    }
  });
};


exports.create_a_category = function(req, res) {

var new_category = new Category(req.body);

new_category.save(function(err, category) {
  if (err) {
    console.log(Date() + ": " + err);
        res.send(err);
  } else {
    console.log(Date() + ": " + "New Category with id:'" + category._id + "' created.");
      res.status(201).send(category);
    }
});
};


exports.read_a_category = function(req, res) {

Category.findById(req.params.categoryId, function(err, category) {
  if (err){
    res.status(500).send(err);
  } else if (category === null) {
    res.json({ message: 'Category does not exist' });
  } else {
    res.send(category);
  }
});
};


exports.update_a_category = function(req, res) {

Category.findOneAndUpdate({_id: req.params.categoryId }, req.body, {new: true}, function(err, category) {
  if (err){
    if(err.name=='ValidationError') {
        res.status(422).send(err);
    }
    else{
      res.status(500).send(err);
    }
  }
  else{
    res.json(category);
}
});
};


exports.delete_a_category = function(req, res) {

Category.deleteOne({_id: req.params.categoryId }, function(err, category) {
  if (err){
    res.status(500).send(err);
  }
  else{
    res.json({ message: 'Category successfully deleted' });
  }
});
};
