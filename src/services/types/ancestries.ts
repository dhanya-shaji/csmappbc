
import * as utils from "../../shared/utilities";
import { CustomFieldResponseData } from "../../clients/types/custom-fields";
import { ProductResponseData } from "../../clients/types/product";

export const AncestryFields = {
    Cat: "cat",
    Line: "RptSubCollection",
    Type: "RptProfitCenter",
    Family: "RptFamily",
    Category: "RptCategory",
    Gender: "gender",
    Fitting: "SizeFitting"
}

function rawToNormalizedSearchKey(rawSearchKeys: Array<string>): Array<string> {
    let alphabetOnly = (word: string) => { return (word) ? word.replace(/[^A-Za-z]/gi, " ").toLowerCase() : null }
    let alphabetOnlies = rawSearchKeys.map(alphabetOnly);
    let trimmed = alphabetOnlies.map(text => text.replace(/\s+/gi, " ")?.trim());
    return trimmed;
}

export class Ancestry {
    constructor(product: ProductResponseData, customFields: Array<CustomFieldResponseData>) {
        let years = utils.extractYears(product.name)
        this.productId = product.id;
        this.productSku = product.sku;
        this.cat = customFields.find(item => item.name === AncestryFields.Cat)?.value;
        this.productType = customFields.find(item => item.name === AncestryFields.Type)?.value;
        this.productFamily = customFields.find(item => item.name === AncestryFields.Family)?.value;
        this.productGender = customFields.find(item => item.name === AncestryFields.Gender)?.value;
        this.productYears = years;
        this.searchKeys = rawToNormalizedSearchKey([this.productType, this.productFamily, this.productGender]);
    }
    cat: string;
    productId: number;
    productSku: string;
    productType: string;
    productFamily: string;
    productGender: string;
    productYears: Array<number>;
    searchKeys: Array<string>;
}
