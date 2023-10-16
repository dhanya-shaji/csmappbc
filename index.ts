import express, { Express} from 'express';
import { config as dotenvConfig } from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ProductValidator } from './src/validation/ProductValidator';


const app: Express  = express();

dotenvConfig();
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Routers imports
var productRouter = require("./src/routes/ProductRouter");
var CategoryRouter = require("./src/routes/CategoryRouter");

//Router usage
app.use("/product",ProductValidator, productRouter);
app.use("/categories", CategoryRouter);

const port = 3000;

app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});