import { csv2json, Csv2JsonOptions } from "json-2-csv";
import { Entry } from "./types/search-keyword-entry";


export async function readSearchKeywordMap(path: string): Promise<Map<string,Array<string>>> {
    const options: Csv2JsonOptions = {
        headerFields: Object.keys(new Entry())
    }
    const fs = require("fs");
    const data = fs.readFileSync(path).toString('utf-8');
    const objects = await csv2json(data, options);
    const tail = objects.slice(1) //remove header
    const entries = tail.map( object => object as Entry);
    let map = new Map<string,Array<string>>();
    for(let entry of entries){
        const key = entry.key
        const value = entry.value.split(",");
        map.set(key,value);
    }
    return map; 
}
