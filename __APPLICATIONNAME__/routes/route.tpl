var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var __MODELNAME__ = require('../models/__MODELNAME__.js');

/* GET /__MODELNAMELOWERPLURAL__ listing. */
router.get('/', function(req, res, next) {
  __MODELNAME__.findAndPopulate(function (err, __MODELNAMELOWERPLURAL__) {
    if (err) return next(err);
    res.json(__MODELNAMELOWERPLURAL__);
  });
});



/* POST /__MODELNAMELOWERPLURAL__ */
router.post('/', function(req, res, next) {
  __MODELNAME__.create(req.body, function (err, post) {
    if (err) return next(err);
    __MODELNAME__.updateRelationsOnCreate(post, function(err){
    });

    res.json(post);

  });
});

/* GET /__MODELNAMELOWERPLURAL__/id */
router.get('/:id', function(req, res, next) {
  __MODELNAME__.findByIdAndPopulate(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* PUT /__MODELNAMELOWERPLURAL__/:id */
router.put('/:id', function(req, res, next) {


    req.body._id = req.params.id;
  __MODELNAME__.updateRelationsPreUpdate(req.body, function(err, obj){
    if (err) return next(err);
    __MODELNAME__.findByIdAndUpdate(req.params.id, obj, function (err, post) {
      if (err) return next(err);

      __MODELNAME__.updateRelationsOnCreate(post, function(err){
        res.json(post);
      });

      });
    });
});

/* DELETE /__MODELNAMELOWERPLURAL__/:id */
router.delete('/:id', function(req, res, next) {
  __MODELNAME__.updateRelationsPreDelete(req.params.id, function(err, obj){
    __MODELNAME__.findByIdAndRemove(req.params.id, req.body, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });
});

module.exports = router;
