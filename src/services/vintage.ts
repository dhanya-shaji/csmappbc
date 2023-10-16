import { VintageProduct } from "../import/authorized-vintage";
import fs from 'fs/promises';
import { identity } from 'fp-ts/lib/function';
import { Catalog } from "./catalog";
import * as utils from "../shared/utilities";
import { Condition, InventoryTracking, OpenGraphType, OptionType, ProductResponse, ProductType, UpsertProductRequest } from "../clients/types/product";
import pluralize from "pluralize";
import { UpsertImageRequest } from "../clients/types/image";
import { OptionResponse, OptionResponseData, UpsertOptionRequest, UpsertOptionValueRequest } from "../clients/types/options";
import { UpsertV2VariantRequest } from "../clients/types/v2-variants";
import { UpsertVariantRequest } from "../clients/types/variants";
import { CustomFieldResponseData, UpsertCustomFieldRequest } from "../clients/types/custom-fields";
import path from "path";
export class VintageCatalog extends Catalog {
    public createProductFromVintage = async (vintageProduct: VintageProduct, commit: boolean, images: boolean, generateKeywords: boolean, inventory: boolean) => {
        let product = new ProductResponse;
        let productId = 0;
        let allResponse: any = {}
        let allErrors: any = {}
        try {
            const productSku = this.productSkuFromVintageProduct(vintageProduct)
            const existingProduct = (await this.getSlimProducts()).find(product => product.sku === productSku && product.name === vintageProduct.name);
            const productIsVisible = !!existingProduct?.is_visible;
            let upsertProductRequest: UpsertProductRequest = await this.productFromVintageProduct(productSku, vintageProduct, productIsVisible, inventory);
            product = await this.getBigCommerceClient().upsertProduct(upsertProductRequest);
            if(product?.data){
                allResponse.product = product?.data;
            }else{
                allErrors.productUploadError = product;
            }
            
            // console.log("product", product)
            productId = product.data.id;
            utils.log(`[${productId}] uploading`);
            
            let variantImage: Buffer = null;
            let variantImageFileName: string = "";
            if (images) {
                const directory:string = "webdav";
                for (const file of await fs.readdir(directory)) {
                    await fs.unlink(path.join(directory, file));
                  }      
                try {         
                    const existingImages = await this.getBigCommerceClient().readAllImages(productId);
                    const thumbNailAlreadySet = existingImages.filter(image => image.is_thumbnail).map(image => this.imageFileToFileName(image.image_file));
                    const webdav = this._webdavClient;
                    // webdav.listImagesInFolder('product_images/optimized_import');
                    const certificate = "Certificate of Authenticity";
                    const description = `${vintageProduct.brand} ${vintageProduct.name}`;
                    const prefix = vintageProduct.sku.toUpperCase();
                    const imageNames = this.imageNamesFromVintageProduct(vintageProduct, prefix);
                    const imageIndexMap = new Map<string, number>();
                    for (let i = 0; i < imageNames.length; i++) {
                        const name = imageNames[i];
                        imageIndexMap.set(name, i)
                    }
                    const imageBatches = utils.batchArray(imageNames, 10);
                    const requests = (await Promise.all(imageBatches.map(async imageNameBatch => {
                        const requestBatch = utils.mapSequentially(imageNameBatch, async imageName => {
                            try {
                                const localFilePath = `./webdav/${imageName}`
                                if (await fs.access(localFilePath, fs.constants.F_OK)
                                    .then(() => false)
                                    .catch(() => true)) {
                                    if (await webdav.exists(imageName) === false) return null;
                                    utils.log(`[${productSku}:${productId}] downloading ${imageName} from WebDAV`);
                                    const downloadResponse = await webdav.downloadImageByName(imageName);
                                }
                                const imageFile = await fs.readFile(localFilePath);
                                if (Buffer.byteLength(imageFile) === 0) return null;
                                const index = imageIndexMap.get(imageName);
                                const request: UpsertImageRequest = {
                                    is_thumbnail: (thumbNailAlreadySet.length === 1) ? thumbNailAlreadySet.includes(imageName) : imageName.includes("_B.jpg"),
                                    product_id: productId,
                                    file_name: imageName,
                                    image_file: imageFile,
                                    sort_order: index,
                                    description: imageName.includes("COA_") ? certificate : description
                                }
                                return request;
                            } catch (error) {
                                allErrors.imageUploadError = error;
                            }
                            return null;
                        })
                        return requestBatch;
                    }))).flatMap(identity);
                    const filteredRequests = requests.filter(r => !!r && !r.file_name.includes("_F"));
                    const frontImages = requests.filter(r => !!r && r.file_name.includes("_F"));
                    const variantImageRequest = frontImages[0];
                    variantImage = variantImageRequest.image_file;
                    variantImageFileName = variantImageRequest.file_name;
                    await this.getBigCommerceClient().deleteProductImageByName(productId, variantImageFileName);
                    const responses = await utils.mapSequentially(filteredRequests, this.getBigCommerceClient().upsertProductImage);
                    const deleteImages = await utils.mapSequentially(frontImages, frontImage => this.getBigCommerceClient().deleteProductImageByName(productId, frontImage.file_name));
                    allResponse.productImageResponse = responses;
                }
                catch (error: any) {
                    allErrors.imageUploadErrors = error;
                }
            }
            let upsertOptionRequests: Array<UpsertOptionRequest> = this.optionsFromVintageProduct(productId, vintageProduct);
            let optionResponses = new Array<OptionResponse>();
            
                optionResponses = await Promise.all(upsertOptionRequests.map(async optionRequest => {
                    let response = await this.getBigCommerceClient().upsertOptionByProductId(productId, optionRequest);
                    if(response?.data){
                        allResponse.productOptionResponses = response;
                    }else{
                        allErrors.productOptionError = response;
                    }
                    return response;

                }));
        
            let optionResponseDatas = optionResponses.map(response => response.data)
            let upsertV2VariantRequests: Array<UpsertV2VariantRequest> = this.v2VariantsFromVintageProduct(optionResponseDatas, vintageProduct, productIsVisible, inventory);

                let variantResponse = await utils.mapSequentially(upsertV2VariantRequests, (async variantRequest => {
                    let response = await this.getBigCommerceClient().upsertV2VariantByProductId(productId, variantRequest)
                    return response;
                }

                ))
                allResponse.productV2VariantResponses = variantResponse;
            


            const upsertVariantRequests: Array<UpsertVariantRequest> = this.variantsFromVitangeProduct(productId, optionResponseDatas, vintageProduct, productIsVisible, inventory);
            if (upsertVariantRequests) {
                const variantResponse = await utils.mapSequentially(upsertVariantRequests, (async variantRequest => {
                    let response = await this.getBigCommerceClient().upsertVariantByProductId(productId, variantRequest)
                    return response;
                }))
                allResponse.productVariantResponse = variantResponse;
                if (images) {
                    let variants = (await this.getBigCommerceClient().readVariants(productId))?.data.filter(variant => variant.sku.includes(vintageProduct.sku));
                    await Promise.all(variants.map(async variant => {
                        try {
                            await this.getBigCommerceClient().uploadVariantImage(productSku, productId, variant.id, variantImageFileName, variantImage);
                        } catch (error) {
                            allErrors.variantError = error;
                        }
                    }));
                }
            }
            let upsertCustomFieldRequests: Array<UpsertCustomFieldRequest> = this.customFieldsFromVintageProduct(vintageProduct);
            let customFieldResponses = new Array<CustomFieldResponseData>();
            if (upsertCustomFieldRequests) {
                customFieldResponses = await utils.mapSequentially(upsertCustomFieldRequests, async customFieldRequest =>
                    this.getBigCommerceClient().upsertCustomFieldByProductId(productId, customFieldRequest));
            }
            allResponse.productcustomFieldResponse = customFieldResponses;
            if (generateKeywords) {
                upsertProductRequest.search_keywords = await this.getGeneratedKeywordsForProduct(product?.data, customFieldResponses, true);
                product = await this.getBigCommerceClient().upsertProduct(upsertProductRequest);
            }
            allResponse.productGenerateKeywordResponse = upsertProductRequest;

        } catch (error) {
            allErrors.generateKeywordsError = error;

        }

        return { allResponse, allErrors };
    }


    //product sku 
    private productSkuFromVintageProduct = (vintageProduct: VintageProduct) => {
        return `${vintageProduct.sku}_P`
    }
    private priceFromVintagePrice = (value: string) => {
        return Number(value.replace(/\$/g, ""))
    }

    private descriptionFromVintageProduct = (vintageProduct: VintageProduct): string => {
        let separateLines = vintageProduct.productFeatureCopy.match(/[^\r\n]+/g);
        let text = "<ul>"
        if (separateLines) {
            for (const line of separateLines) {
                text = text.concat(`<li>${line}</li>`);
            }
        }
        text = text.concat("</ul>");
        return text;
    }

    private categoriesFromVintageProduct = async (vintageProduct: VintageProduct) => {
        const vintageCategory = vintageProduct.category;
        const categories = await this.getCategories();
        const leaves = categories.filter(category => category.name === vintageCategory);
        const includedRootNames = ["All Collections", vintageProduct.brand, vintageProduct.category];
        const genderRootNames = (vintageProduct.gender === "Unisex") ? ["Men", "Women"] : [pluralize.plural(vintageProduct.gender.trim()).replace(/s$/g, "")];
        includedRootNames.push.apply(includedRootNames, genderRootNames);
        const allCollectionsCategory = categories.find(category => category.name === "All Collections");
        this._allCollectionsCategoryId = allCollectionsCategory ? allCollectionsCategory.id : this._allCollectionsCategoryId;
        let includedRootIds = categories
            .filter(category => includedRootNames.includes(category.name) && category.parent_id === 0)
            .map(category => category.id);
        let vintageCategories = [this._allCollectionsCategoryId];
        for (const leaf of leaves) {
            let subCategories: any = [];
            subCategories.push(leaf.id);
            let parentId = leaf.parent_id;
            do {
                let parentCategory = await this.categoryFromId(parentId);
                if (parentCategory) {
                    subCategories.push(parentCategory.id);
                    parentId = parentCategory.parent_id;
                } else {
                    parentId = 0;
                }
            } while (parentId !== 0)
            if (subCategories.length > 0) {
                let rootId: number = subCategories[subCategories.length - 1]
                if (includedRootIds.includes(rootId)) {
                    vintageCategories.push.apply(vintageCategories, subCategories);
                }
            }
        }
        return vintageCategories.filter(Number);
    }


    private productFromVintageProduct = async (productSku: string, vintageProduct: VintageProduct, productIsVisible: boolean, inventory: boolean) => {
        const productUrl = (vintageProduct.productUrl) ?
            vintageProduct.productUrl :
            "/product/" + encodeURIComponent(utils.toAlphaNumericSnakeCase(`${vintageProduct.brand.toLowerCase()} ${vintageProduct.name}`));
        let product: UpsertProductRequest = {
            name: vintageProduct.name,
            type: ProductType.physical,
            sku: productSku,
            weight: 0, // 0 oz
            price: this.priceFromVintagePrice(vintageProduct.retailPrice),
            cost_price: this.priceFromVintagePrice(vintageProduct.costPrice),
            retail_price: this.priceFromVintagePrice(vintageProduct.retailPrice),
            brand_name: vintageProduct.brand,
            categories: await this.categoriesFromVintageProduct(vintageProduct),
            inventory_level: 1,
            inventory_tracking: InventoryTracking.variant,
            product_tax_code: new String(vintageProduct.taxCode).toString() || "61000",
            description: this.descriptionFromVintageProduct(vintageProduct),
            meta_description: vintageProduct.metaDescription,
            condition: Condition.New,
            is_condition_shown: false,
            is_visible: productIsVisible,
            open_graph_type: OpenGraphType.product,
            open_graph_title: "",
            open_graph_description: "",
            open_graph_use_meta_description: true,
            open_graph_use_product_name: true,
            open_graph_use_image: true,
            page_title: `${vintageProduct.brand} ${vintageProduct.name}`,
            custom_url: {
                url: productUrl
            }
        }
        if (!inventory) delete product.inventory_level;
        return product;
    }

    private imageNamesFromVintageProduct = (vintageProduct: VintageProduct, sku: string) => {
        let imageNames = new Array<string>();
        const hyphenSku = sku.replace("_", "-");
        for (let prefix of [sku, hyphenSku]) {
            imageNames.push(`${prefix}_F.jpg`);
            imageNames.push(`${prefix}_F.jpeg`);
            imageNames.push(`${prefix}_F.gif`);
            imageNames.push(`${prefix}_B.jpg`);
            imageNames.push(`${prefix}_B.jpeg`);
            imageNames.push(`${prefix}_B.gif`);
            for (let i = 1; i < 18; i++) {
                const padded = (i < 10) ? `0${i}` : i;
                imageNames.push(`${prefix}_ALT${padded}.jpg`);
                imageNames.push(`${prefix}_ALT${padded}.jpeg`);
                imageNames.push(`${prefix}_ALT${padded}.gif`);
            }
        }

        imageNames.push(vintageProduct.productImageFile1);
        imageNames.push(vintageProduct.productImageFile2);
        imageNames.push(vintageProduct.productImageFile3);
        imageNames.push(vintageProduct.productImageFile4);
        imageNames.push(vintageProduct.productImageFile5);
        imageNames.push(vintageProduct.productImageFile6);
        imageNames.push(vintageProduct.productImageFile7);

        const filterd = imageNames?.filter((name: string) => name?.length > 4);
        return filterd;

    }

    private optionsFromVintageProduct = (productId: number, vintageProduct: VintageProduct) => {
        let options = new Array<UpsertOptionRequest>();
        let sizeValue: UpsertOptionValueRequest = {
            label: vintageProduct.size,
            sort_order: 0,
            is_default: false
        }
        let colorValue: UpsertOptionValueRequest = {
            label: vintageProduct.color,
            sort_order: 0,
            value_data: {
                "colors": [
                    `#${vintageProduct.colorHexValue}`.replace(/#+/, "#").toLocaleUpperCase()
                ]
            },
            is_default: true
        };
        let sizeOption: UpsertOptionRequest = {
            product_id: productId,
            display_name: "Size",
            type: OptionType.rectangles,
            sort_order: 0,
            option_values: [
                sizeValue
            ]
        };
        options.push(sizeOption);
        let colorOption: UpsertOptionRequest = {
            product_id: productId,
            display_name: "Color",
            type: OptionType.swatch,
            sort_order: 1,
            option_values: [
                colorValue
            ]
        }
        options.push(colorOption);
        return options;
    }

    private v2VariantsFromVintageProduct = (optionValues: Array<OptionResponseData>, vintageProduct: VintageProduct, productIsVisible: boolean, inventory: boolean) => {
        let variant: UpsertV2VariantRequest = {
            sku: vintageProduct.sku,
            price: vintageProduct.retailPrice.replace(/\$/g, "").trim(),
            cost_price: vintageProduct.costPrice.replace(/\$/g, "").trim(),
            adjusted_price: vintageProduct.costPrice.replace(/\$/g, "").trim(),
            inventory_level: vintageProduct.inventory,
            inventory_warning_level: 0,
            is_purchasing_disabled: productIsVisible,
            options: this.v2VariantOptionValueFromOptionOptionValue(optionValues, vintageProduct.color, vintageProduct.size)
        }
        if (!inventory) delete variant.inventory_level;
        return new Array(variant);
    }

    private variantsFromVitangeProduct = (productId: number, optionValues: Array<OptionResponseData>, vintageProduct: VintageProduct, productIsVisible: boolean, inventory: boolean) => {

        let variant: UpsertVariantRequest = {
            product_id: productId,
            sku: vintageProduct.sku,
            price: this.priceFromVintagePrice(vintageProduct.retailPrice),
            cost_price: this.priceFromVintagePrice(vintageProduct.costPrice),
            is_free_shipping: false,
            inventory_level: vintageProduct.inventory,
            inventory_warning_level: 0,
            purchasing_disabled: productIsVisible,
            option_values: this.variantOptionValueFromOptionOptionValue(optionValues, vintageProduct.color, vintageProduct.size)
        }
        if (!inventory) delete variant.inventory_level;
        return new Array(variant);
    }

    private customFieldsFromVintageProduct = (vintageProduct: VintageProduct) => {
        let customFields = new Array<UpsertCustomFieldRequest>()
        if (vintageProduct.gender.includes("Unisex")) {
            let gender1: UpsertCustomFieldRequest = {
                name: "gender",
                value: "Men"
            }
            customFields.push(gender1);
            let gender2: UpsertCustomFieldRequest = {
                name: "gender",
                value: "Women"
            };
            customFields.push(gender2);
            let gender3: UpsertCustomFieldRequest = {
                name: "gender",
                value: "Unisex"
            };
            customFields.push(gender3);
        } else if (vintageProduct.gender.includes("Men")) {
            let gender1: UpsertCustomFieldRequest = {
                name: "gender",
                value: "Men"
            };
            customFields.push(gender1);
        } else if (vintageProduct.gender.includes("Women")) {
            let gender1: UpsertCustomFieldRequest = {
                name: "gender",
                value: "Women"
            };
            customFields.push(gender1);
        }
        let sizeFitting: UpsertCustomFieldRequest = {
            name: "SizeFitting",
            value: vintageProduct.sizeFitting
        };
        customFields.push(sizeFitting);
        let cat: UpsertCustomFieldRequest = {
            name: "cat",
            value: vintageProduct.category
        }
        customFields.push(cat);
        let rptCategory: UpsertCustomFieldRequest = {
            name: "RptCategory",
            value: vintageProduct.rptCategory
        };
        customFields.push(rptCategory);
        let rptFamily: UpsertCustomFieldRequest = {
            name: "RptFamily",
            value: vintageProduct.rptFamily
        };
        customFields.push(rptFamily);
        let rptProfitCenter: UpsertCustomFieldRequest = {
            name: "RptProfitCenter",
            value: vintageProduct.rptProfitCenter
        };
        customFields.push(rptProfitCenter);
        let rptSAPL5: UpsertCustomFieldRequest = {
            name: "RptSAPL5",
            value: vintageProduct.rptSAPL5
        };
        customFields.push(rptSAPL5);
        let rptSubCollection: UpsertCustomFieldRequest = {
            name: "RptSubCollection",
            value: "Authorized Vintage"
        };
        customFields.push(rptSubCollection);
        let brand: UpsertCustomFieldRequest = {
            name: "Brand",
            value: "Authorized Vintage"
        };
        customFields.push(brand);
        let beauty: UpsertCustomFieldRequest = {
            name: "Beauty",
            value: vintageProduct.beautyCopy
        };
        customFields.push(beauty);
        return customFields;
    }
}