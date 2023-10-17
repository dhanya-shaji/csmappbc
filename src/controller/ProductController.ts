import { Request, Response } from 'express';
import { VintageCatalog } from '../services/vintage';
import { BigCommerceApiClient, BigCommerceClientOptions } from '../clients/bigcommerce-api-client';
import { validationResult } from 'express-validator'
import * as utils from "../shared/utilities";
import { VintageProduct } from '../import/authorized-vintage';
const environmentBcClientOptionsMap = new Map<string, BigCommerceClientOptions>([
    ["DEV", {
        storeHash: process.env["DEV_BC_API_STORE_HASH"],
        accessToken: process.env["DEV_BC_API_ACCESS_TOKEN"]
    }],
    ["QA", {
        storeHash: process.env["QA_BC_API_STORE_HASH"],
        accessToken: process.env["QA_BC_API_ACCESS_TOKEN"]
    }],
    ["STG", {
        storeHash: process.env["STG_BC_API_STORE_HASH"],
        accessToken: process.env["STG_BC_API_ACCESS_TOKEN"]
    }],
    ["PROD", {
        storeHash: process.env["PROD_BC_API_STORE_HASH"],
        accessToken: process.env["PROD_BC_API_ACCESS_TOKEN"]
    }],
    ["SUDO", {
        storeHash: process.env["SUDO_BC_API_STORE_HASH"],
        accessToken: process.env["SUDO_BC_API_ACCESS_TOKEN"]
    }],
]);

export const createCatalogProduct = async function (req: Request, res: Response) {
    try {
        const errors = validationResult(req)
        console.log('hello',errors);
        if (errors.isEmpty()) {
            var body = req.body;
            console.log(req.body);
            const type = req.body.type
            const vintageProducts = req.body.product;
            const keywords:boolean =req.body.keywords;
            const images:boolean = req.body.images;
            const commit:boolean = true;
            const inventory:boolean = req.body.inventory;
            if (type === "vintage") {
                const sourceEnvironment = (body.source) ? body.source.toUpperCase() : "DEV";
                const targetBigCommerceClientOptions = environmentBcClientOptionsMap.get(sourceEnvironment);
                const targetBigCommerceClient = new BigCommerceApiClient(targetBigCommerceClientOptions);
                const targetCatalog = new VintageCatalog(targetBigCommerceClient);
                const data: any = [];
                const error: any = [];
                const batchSize = 100;
                const productBatches = utils.batchArray(vintageProducts, batchSize);
                Promise.allSettled(await productBatches.map(async products => {
                    await utils.mapSequentially(products, async (selectProduct:VintageProduct) => {
                        const response = await targetCatalog.createProductFromVintage(selectProduct, commit, images, keywords, inventory);
                        data.push(response.allResponse)
                        error.push(response. allErrors)
                    })
                })).then(() => { 
                    if (data) {
                        return res.status(200).send({
                            message: "success123",
                            value: process.env["DEV_BC_API_STORE_HASH"],
                            test:"testing",
                            status: 200,
                            data: data,
                            error:error
                        });
    
                    } else {
                        return res.status(400).send({
                            message: "failed",
                            status: 400,
                            data: "",
                            error: "upload failed"
                        });
                    }
                 });



           
            }
        }else{
                 res.status(422).json({ errors: errors.array() })
        }
   
    }
    catch (errors) {
        console.log('Caught promise rejection (validation failed). Errors: ', errors);
    }
}
