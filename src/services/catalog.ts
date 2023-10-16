import { BigCommerceApiClient } from "../clients/bigcommerce-api-client";
import { WebDavClient } from "../clients/bigcommerce-webdav";
import { CategoryResponseData } from "../clients/types/category";
import { CustomFieldResponseData } from "../clients/types/custom-fields";
import { OptionResponseData } from "../clients/types/options";
import { ProductResponseData, SlimProductResponseData } from "../clients/types/product";
import { V2VariantOptionValue } from "../clients/types/v2-variants";
import { UpsertVariantOptionValue } from "../clients/types/variants";
import { readSearchKeywordMap } from "../import/search-keyword";
import { Ancestry } from "./types/ancestries";
import * as utils from "../shared/utilities";


export class Catalog {
    protected _bigcommerceClient: BigCommerceApiClient;
    protected _storeHash ?: string = "";
    protected _slimProducts: Array<SlimProductResponseData> = [];
    protected _categories: Array<CategoryResponseData> = [];
    protected _allCollectionsCategoryId?:number |null = null;
    protected _categoryFromIdMap = new Map<number, CategoryResponseData>();
    protected _webdavClient = new WebDavClient();

    constructor(bigcommerceClient: BigCommerceApiClient) {
        this._bigcommerceClient = bigcommerceClient;
        this._storeHash = bigcommerceClient.getStoreHash()
    }

    getSlimProducts = async (reload: boolean = false) => {
        let size = this._slimProducts.length
        this._slimProducts = (size < 1 || reload) ? await this._bigcommerceClient.readAllSlimProducts() : this._slimProducts;
        return this._slimProducts;
    }
    getCategories = async (reload: boolean = false) => {
        let size = this._categories.length;
        this._categories = (size < 1 || reload) ? await this._bigcommerceClient.readAllCategories() : this._categories;
        return this._categories;
    }
    categoryFromId = async (categoryId: number): Promise<CategoryResponseData> => {
        if (this._categoryFromIdMap.size === 0) {
            const categories = await this.getCategories();
            this._categoryFromIdMap = new Map(categories.map(category => [category.id, category]));
        }
    
        const category = this._categoryFromIdMap.get(categoryId);
    
        if (category) {
            return category;
        } else {
            throw new Error(`Category with ID ${categoryId} not found.`);
        }
    }
    public getBigCommerceClient = (): BigCommerceApiClient => {
        return this._bigcommerceClient;
    }

    protected imageFileToFileName = (imageFile: string) => {
        // "image_file": "v/542/96344-24CM_ALT08__24244.jpg",
        const extension = imageFile.split("__").slice(-1)[0].replace(/\d/g, "");
        const fileName = imageFile.split("__")[0].split("/").slice(-1)[0];
        return fileName + extension;
    }

    protected v2VariantOptionValueFromOptionOptionValue = (optionValues: Array<OptionResponseData>, color: string, size: string): Array<V2VariantOptionValue> => {
        let nameLabelMap = new Map([
            ["Color", color],
            ["Size", size]
        ])
        let variantOptionValues = new Array<V2VariantOptionValue>();
        nameLabelMap.forEach((label, name) => {
            let foundOption = optionValues.find(option => option.display_name === name);
            let foundValue = foundOption.option_values.find(value => value.label === label);
            let variantOptionValue: V2VariantOptionValue = {
                product_option_id: foundOption.id,
                option_value_id: foundValue.id
            }
            variantOptionValues.push(variantOptionValue);
        });
        return variantOptionValues;
    }

    protected variantOptionValueFromOptionOptionValue = (optionValues: Array<OptionResponseData>, color: string, size: string): Array<UpsertVariantOptionValue> => {
        let nameLabelMap = new Map([
            ["Color", color],
            ["Size", size]
        ])
        let variantOptionValues = new Array<UpsertVariantOptionValue>();
        nameLabelMap.forEach((label, name) => {
            let foundOption = optionValues.find(option => option.display_name === name);
            let foundValue = foundOption.option_values.find(value => value.label === label);
            let variantOptionValue: UpsertVariantOptionValue = {
                label: foundValue.label,
                option_id: foundValue.id,
                option_display_name: foundOption.display_name
            }
            variantOptionValues.push(variantOptionValue);
        });
        return variantOptionValues;
    }

    public generateSuggestedKeywords = async (ancestry: Ancestry, preowned: boolean = false): Promise<string> => {
        const searchKeywordMap = await readSearchKeywordMap("./collections-search-keyword-map.csv");
        let keywords = (preowned) ? ["preowned", "pre-owned"] : [];
        keywords.push.apply(keywords, ancestry.searchKeys.flatMap(word => {
            const result = searchKeywordMap.get(word);
            if (result) {
                return result
            } else {
                return [];
            }
        }))
        keywords.push.apply(keywords, utils.pluralize(keywords));
        if (ancestry.productYears.length > 0) {
            let years = utils.decadeToYears(ancestry.productYears).map(item => item.toString());
            keywords.push.apply(keywords, years);
        }
        let normalized = utils.normalizeWords(keywords);
        utils.log(`[${ancestry.productSku}] generating ${normalized.length} Search Keywords`);
        return normalized.join(',');
    }
    
    getGeneratedKeywordsForProduct = async (product: ProductResponseData, customFields: Array<CustomFieldResponseData>, preowned: boolean = false): Promise<string> => {
        if (!product) return null;
        let ancestry = new Ancestry(product, customFields);
        return this.generateSuggestedKeywords(ancestry, preowned)
    }

}