import { ProductValidator } from "../validation/ProductValidator";

var express = require("express");
var router = express.Router();

var ProductController = require('../controller/ProductController');
var TestProductController = require('../controller/unittest/ProductController');

router.post("/create",ProductValidator, ProductController.createCatalogProduct);
router.get("/getproducts", TestProductController.GetProducts);

module.exports = router;