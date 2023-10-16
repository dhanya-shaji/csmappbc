const express = require('express');
const chai    = require('chai');
const request = require('supertest');
var expect    = require("chai").expect;

const app     = express();
const baseURL = "http://localhost:5000";


describe('Create Products by Route', function () {
    
  it('responds to /createproducts', async () => {
    const res = await request(baseURL).post('/product/create').send({
      "product":[
          {
              " Beauty Copy": "Righteous long sleeve thermal from 1985. Long John’s body with cool, photo-realistic graphics and nice bright colors that jump off the slightly faded black fabric. Originally printed for Fischer’s Harley-Davidson® in Elgin, IL. More on dealer below.",
              "brand": "Authorized Vintage",
              "category": "Tops",
              "Color": "Black",
              "costPrice": "$87.50",
              "gender": "Women",
              "Hex Value": "3D4043",
              "Inventory": "1",
              "metaDescription": "Find the Authorized Vintage Women's 1985 Eagle Thermal — L at Collections.Harley-Davidson.com. Free shipping on all orders and free returns.",
              "sku": "JUL23_001",
              "productFeatureCopy": "Vintage items are unique and may show signs of wear.\nMaterials: 50% Kodel® polyester, 50% cotton, waffle knit. \nDesign Details: Rib-knit neckline and cuffs. Seam-finished, raw edge hem.\nGraphics: Screen print.\nProduct Measurements: Center Front: 23.25\". Center Back: 27\". Pit-to-Pit: 17.25\".\nFor directions on how we measure, please check under Size & Fit. \nAuthorized Vintage products are certified by the Motor Company's curators and delivered with a Certificate of Authenticity.\nThis vintage thermal was originally created as a motorcycle dealership item for Fischer’s Harley-Davidson® in Elgin, Illinois.",
              "Product Image File - 1": "COA_0323_01.jpg",
              "Product Image File - 2": "",
              "Product Image File - 3": "",
              "Product Image File - 4": "",
              "Product Image File - 5": "",
              "Product Image File - 6": "",
              "Product Image File - 7": "",
              "name": "Women's 1985 Eagle Thermal — L",
              "productUrl": "",
              "retailPrice": "$175.00 ",
              "RptCategory": "112:Sportswear Womens",
              "RptFamily": "03:Tops Knit",
              "RptProfitCenter": "02:Long Sleeve",
              "RptSAPL5": "RCOMNIVINTAPPAREL",
              "ShadeFamily": "Black",
              "Size": "L",
              "Size Fitting": "L",
              "Tax Code": "61000"
              }  
              ],
              "type":"vintage",
              "source":"DEV",
              "filter":null,
              "images":true
  });   
    expect(res.statusCode).to.equal(200);    
  });
});


describe('Get Products by Route', function () {
    
  it('responds to /getproducts', async () => {
    const res = await request(baseURL).get('/product/getproducts');    
    expect(res.statusCode).to.equal(200);    
  });
});
