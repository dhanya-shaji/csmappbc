var express = require("express");
var router = express.Router();




var CategoryController = require('../controller/CategoryController');

router.get("/", CategoryController.AllCatagory);


module.exports = router;