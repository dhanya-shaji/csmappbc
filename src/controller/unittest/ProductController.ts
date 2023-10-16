var request = require('request');
import { Request, Response } from 'express';

// Unit Testing Sample
exports.GetProducts = function (req:Request, res:Response) {
    var request = require('request');
    const store_hash=req.headers["store-hash"];    
    var auth_token   = "btghi8uws3o12gvegewj8wnaarplcyi";//process.env.AUTH_TOKEM;
    var options = {
    'method': 'GET',
    'url': 'https://api.bigcommerce.com/stores/94bastr1it/v2/products',
    'headers': {
        'X-Auth-Token': auth_token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        "name": "Test Brand",
        "page_title": "Test Brand",
        "meta_keywords": [
        "modern, clean, contemporary"
        ],
        "meta_description": "Common Good is a modern brand.",
        "search_keywords": "kitchen, laundry, cart, storage",
        "image_url": "https://picsum.photos/seed/picsum/400/600",
        "custom_url": {
        "url": "/shoes",
        "is_customized": true
        }
    })

    };
    request(options, function (error: any, response: any) {
    if (error) throw new Error(error);    
    if (response.statusCode===200) {
        return res.status(200).send({
            message: "success",
            data: response.body.data,
            error:''
          });
       
      } else {
        return res.status(400).send({
            message:"failed",
            data:response?.body?.errors,
            error:response?.body?.errors
          });
      }
    });
}