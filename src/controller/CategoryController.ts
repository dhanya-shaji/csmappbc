var request = require('request');
import {Request, Response } from 'express';

exports.AllCatagory = function (req:Request, res:Response) {
    const store_hash=req.headers["store-hash"];
    const auth_token=req.headers["x-auth-token"];
    var url = `https://api.bigcommerce.com/stores/${store_hash}/v3/catalog/categories`;
    request.get({
        url: url,
        json: true,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': auth_token
        },  
    }, (err:any, response:any, data:any) => {
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