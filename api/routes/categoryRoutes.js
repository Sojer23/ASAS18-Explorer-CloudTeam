'use strict';
module.exports = function(app) {
  var categories = require('../controllers/categoryController');

/**
   * Get a category
   * 
   *
   *  
   * Post a category 
   *    RequiredRoles: to be a manager or administrator
   *
   * @section categories
   * @type get post
   * @url /v1/categories
  */
 app.route('/v1/categories')
 .get(categories.list_all_categories)
 .post(categories.create_a_category);

 /**
 * get results from a search of  category
 *    RequiredRoles: None
 * 
 * @section categories
 * @type get
 * @url /v1/categories/search
 * @param {string} categoryId (categoryId)
 * @param {string} keyword // name or description
 */
app.route('/v1/categories/search')
.get(categories.search_categories);



 /**
   * 
   * Get categories by categoryId
   *
   * Put category to update it
   * Delete a category
   * @section categories
   * @type get put delete
   * @url /v1/categories/:categoryId
   * @param {string} categoryId
  */

 app.route('/v1/categories/:categoryId')
 .get(categories.read_a_category)
 .put(categories.update_a_category)
 .delete(categories.delete_a_category_trip);

 };


 