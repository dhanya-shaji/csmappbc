import axios, { AxiosError, AxiosResponse } from "axios";
import FormData from 'form-data';
import { ProductResponse, SlimProductResponseData, SlimProductsResponse, UpsertProductRequest } from "./types/product";
import { ArrayEnvelope } from "./types/shared";
import { CategoriesResponse, CategoryResponseData } from "./types/category";
import { ImageResponse, ImageResponseData, ImagesResponse, UpsertImageRequest } from "./types/image";
import { OptionResponse, OptionResponseData, OptionsResponse, UpsertOptionRequest } from "./types/options";
import { UpsertV2VariantRequest, V2VariantsResponse } from "./types/v2-variants";
import { UpsertVariantRequest, VariantResponse, VariantResponseData, VariantsResponse } from "./types/variants";
import { CustomFieldResponse, CustomFieldResponseData, CustomFieldsResponse, UpsertCustomFieldRequest } from "./types/custom-fields";


const MAX_API_RETRY = 5;
const jpeg = require('jpeg-js');

export type BigCommerceClientOptions = {
    storeHash?: string,
    accessToken?: string,
    timeout?: number
}
export class BigCommerceApiClient {
    private _BC_API_STORE_HASH;
    private _bigcommerceClient;
    private _bigcommerceFormClient;

    constructor(
        options: BigCommerceClientOptions = {
            storeHash: process.env["DEV_BC_API_STORE_HASH"],
            accessToken: process.env["DEV_BC_API_ACCESS_TOKEN"]
        }) {
        this._BC_API_STORE_HASH = options.storeHash;
        this._bigcommerceClient = axios.create({
            baseURL: `https://api.bigcommerce.com/stores/${this._BC_API_STORE_HASH}`,
            timeout: options.timeout || 60000,
            headers: {
                "X-Auth-Token": options.accessToken,
                "Content-Type": "application/json",
                "Accept": `application/json`
            }
        })

        this._bigcommerceFormClient = axios.create({
            baseURL: `https://api.bigcommerce.com/stores/${this._BC_API_STORE_HASH}`,
            timeout: options.timeout || 60000,
            headers: {
                "X-Auth-Token": options.accessToken,
                "Content-Type": "multipart/form-data",
                "Cache-Control": "no-cache",
            }
        })

    }
    public getStoreHash = (): any => {
        return this._BC_API_STORE_HASH;
    }

    private async _retry<T>(f: () => Promise<AxiosResponse<any, any>>, maxRetries: number = MAX_API_RETRY): Promise<T> {
        let retries = 0;
        while (true) {
            try {
                const response = (await f());
                return response.data;
            } catch (error: any) {
                let axiosError: any = error;
                if (error.config && error.response) {
                    axiosError = {
                        code: error.code,
                        request: {
                            method: error.config?.method,
                            url: error.config?.baseURL + error.config?.url,
                            body: error.config?.data
                        },
                        response: error.response?.data
                    }
                     console.log(axiosError);
                     return(axiosError);
                }
            }
        }
    }

    private async _call<T>(f: () => Promise<AxiosResponse<any, any>>): Promise<T> {
        try {
            const response = (await f());
            return response?.data;
        } catch (error: any) {
            let axiosError: any = error;
            if (error.config && error.response) {
                axiosError = {
                    code: error.code,
                    request: {
                        method: error.config?.method,
                        url: error.config?.baseURL + error.config?.url,
                        body: error.config?.data
                    },
                    response: error.response?.data
                }
               console.log(axiosError);
               return(axiosError);
            }
        }
        return null as T;
    }


    private async _readAll<T>(f: (paramsString?: string) => Promise<ArrayEnvelope<T>>): Promise<Array<T>> {
        let collection = new Array<T>();
        let result = await f();
        let totalPages = result.meta.pagination.total_pages;
        let next = result.meta.pagination.links.next?.replace(/^\?/, "");
        collection.concat(result.data);
        for (let page = 1; page <= totalPages; page++) {
            result = await f(next);
            next = result.meta.pagination.links.next?.replace(/^\?/, "");
            collection = collection.concat(result.data);
        }
        return collection;
    }



  // IMAGES
  // https://developer.bigcommerce.com/docs/rest-catalog/products/images
  public readImage = async (productId: number, imageId: number, paramsString: string = ""): Promise<ImageResponseData> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/images/${imageId}?${paramsString}`)
    return this._retry(request)
  }

  public readImages = async (productId: number, paramsString: string = ""): Promise<ImagesResponse> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/images?${paramsString}`)
    return this._retry(request)
  }

  public readAllImages = async (productId: number): Promise<Array<ImageResponseData>> => {
    let partial = (paramString?: string) => { return this.readImages(productId, paramString) }
    return this._readAll(partial);
  }


  public deleteProductImageByName = async (productId: number, fileName: string, paramsString: string = "") => {
    const images = await this.readAllImages(productId);
    const fileWithoutExtension = fileName.split(".")[0];
    const selected = images.filter(imageResponse => {
      return imageResponse.image_file.includes(fileWithoutExtension)
    });
    const results = selected.map(response => {
      const imageId = response.id;
      this._deleteProductImage(productId, imageId);
    })
  }

  private _deleteProductImage = async (productId: number, imageId: number, paramsString: string = "") => {
    let request = () => this._bigcommerceClient.delete(`/v3/catalog/products/${productId}/images/${imageId}?${paramsString}`);
    return this._call(request);
  }
  private _uploadProductImage = async (productId: number, fileName: string, imageFile: Buffer, paramsString: string = ""): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append("image_file", imageFile, fileName);
    let request = () => this._bigcommerceFormClient.post(`v3/catalog/products/${productId}/images?${paramsString}`, formData);
    return this._call(request)
  }
  private _updateProductImage = async (productId: number, imageId: number, body: UpsertImageRequest, paramsString: string = ""): Promise<ImageResponse> => {
    let request = () => this._bigcommerceClient.put(`v3/catalog/products/${productId}/images/${imageId}?${paramsString}`, body);
    return this._call(request)
  }

  public upsertProductImage = async (request: UpsertImageRequest, paramsString: string = ""): Promise<ImageResponse> => {
    let productId = request.product_id;
    let imageFile = request.image_file;
    let fileName = request.file_name;
    await this.deleteProductImageByName(productId, fileName);
    let uploadResponse = (await this._uploadProductImage(productId, fileName, imageFile))?.data;

    let imageId = uploadResponse?.id;
    let updateRequest: UpsertImageRequest = {
      description: request.description,
      is_thumbnail: request.is_thumbnail,
      sort_order: request.sort_order
    }
    let updateResponse = (await this._updateProductImage(productId, imageId, updateRequest))
    return updateResponse;
  }
  

    // CATEGORIES
    // https://developer.bigcommerce.com/docs/rest-catalog/categories
    //   private _createCategory = async (body: UpsertCategoryRequest, paramsString: string = ""): Promise<CategoryResponse> => {
    //     let request = () => this._bigcommerceClient.post(`/v3/catalog/categories?${paramsString}`, body);
    //     return this._call(request);
    //   }

    public readCategories = async (paramsString: string = ""): Promise<CategoriesResponse> => {
        let request = () => this._bigcommerceClient.get(`/v3/catalog/categories?${paramsString}`);
        return this._retry(request);
    }

    public readAllCategories = async (): Promise<Array<CategoryResponseData>> => {
        return this._readAll(this.readCategories);
    }



    // PRODUCTS
    // https://developer.bigcommerce.com/docs/rest-catalog/products
    private _createProduct = async (body: UpsertProductRequest, paramsString: string = ""): Promise<ProductResponse> => {
        let request = () => this._bigcommerceClient.post(`/v3/catalog/products?${paramsString}`, body);
        return this._call(request);
    }

    public readSlimProducts = async (paramsString: string = ""): Promise<SlimProductsResponse> => {
        let request = () => this._bigcommerceClient.get(`/v3/catalog/products?${paramsString}&include_fields=id,sku,name,brand_id,is_visible`);
        return this._retry(request);
    }


    public readAllSlimProducts = async (): Promise<Array<SlimProductResponseData>> => {
        return this._readAll(this.readSlimProducts);
    }
    private _updateProduct = async <UpsertProductRequest>(productId: number, body: UpsertProductRequest, paramsString: string = ""): Promise<ProductResponse> => {
        let request = () => this._bigcommerceClient.put(`v3/catalog/products/${productId}?${paramsString}`, body)
        return this._call(request)
    }

    public upsertProduct = async (productRequest: UpsertProductRequest): Promise<ProductResponse> => {
        let productId = productRequest.id;
        let productSku = productRequest.sku;
        let products = await this.readSlimProducts(`&sku=${productSku}`);
        if (products?.data?.length === 1) {
            productId = products.data[0].id;
        }
        delete productRequest.id;
        return (products?.data?.length === 1 && productId) ?
            await this._updateProduct(productId, productRequest) :
            await this._createProduct(productRequest);
    }




  // OPTIONS
  // https://developer.bigcommerce.com/docs/rest-catalog/product-variant-options
  private _createOption = async (productId: number, body: UpsertOptionRequest, paramsString: string = ""): Promise<OptionResponse> => {
    let request = () => this._bigcommerceClient.post(`v3/catalog/products/${productId}/options?${paramsString}`, body)
    return this._call(request)
  }

  private _updateOption = async (productId: number, optionId: number, body: UpsertOptionRequest, paramsString: string = ""): Promise<OptionResponse> => {
    let request = () => this._bigcommerceClient.put(`v3/catalog/products/${productId}/options/${optionId}?${paramsString}`, body)
    return this._call(request)
  }


  public readOptions = async (productId: number, paramsString: string = ""): Promise<OptionsResponse> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/options?${paramsString}`)
    return this._retry(request)
  }

  public readAllOptions = async (productId: number): Promise<Array<OptionResponseData>> => {
    let partial = (paramString: string) => { return this.readOptions(productId, paramString) }
    return this._readAll(partial);
  }

  private _readOption = async (productId: number, optionId: number, paramsString: string = ""): Promise<OptionResponse> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/options/${optionId}?${paramsString}`)
    return this._call(request)
  }

  public upsertOptionByProductId = async (productId: number, optionRequest: UpsertOptionRequest): Promise<OptionResponse> => {
    let optionId = optionRequest.id;
    let displayName = optionRequest.display_name;
    let allOptions = await this.readAllOptions(productId);
    let option = (allOptions && allOptions.length > 0) ?
      allOptions.find(option => option.display_name === displayName) :
      null;

    if (option) {
      optionId = option.id;
      const currentLabels = option.option_values.map(values => values.label);
      optionRequest.option_values = optionRequest.option_values.filter(value => !currentLabels.includes(value.label));
    }

    delete optionRequest.id;
    if (option && optionRequest.option_values && optionRequest.option_values.length > 0) {
      optionRequest.option_values = optionRequest.option_values.map(value => { value.is_default = false; return value });
      return this._updateOption(productId, optionId, optionRequest);
    } else if (!option) {
      return this._createOption(productId, optionRequest);
    } else {
      return this._readOption(productId, optionId);
    }

  }
// V2 VARIANTS
  // https://developer.bigcommerce.com/legacy/v2-catalog-products/v2-product-sku
  private _createV2Variant = async (productId: number, body: UpsertV2VariantRequest, paramsString: string = ""): Promise<V2VariantsResponse> => {
    let request = () => this._bigcommerceClient.post(`v2/products/${productId}/skus?${paramsString}`, body)
    return this._call(request);
  }
  public readV2Variant = async (productId: number, sku: string, paramsString: string = ""): Promise<V2VariantsResponse> => {
    let request = () => this._bigcommerceClient.get(`v2/products/${productId}/skus?sku=${sku}${paramsString}`)
    return this._retry(request);
  }

  public readAllV2Variants = async (productId: number, paramsString: string = ""): Promise<V2VariantsResponse> => {
    let request = () => this._bigcommerceClient.get(`v2/products/${productId}/skus?${paramsString}`)
    return this._retry(request);
  }

  private _updateV2Variant = async (productId: number, skuId: number, body: UpsertV2VariantRequest, paramsString: string = ""): Promise<V2VariantsResponse> => {
    let request = () => this._bigcommerceClient.put(`v2/products/${productId}/skus/${skuId}?${paramsString}`, body)
    return this._call(request);
  }

  public deleteV2Variant = async (productId: number, variantId: number, paramsString: string = "") => {
    let request = () => this._bigcommerceClient.delete(`v3/catalog/products/${productId}/variants/${variantId}?${paramsString}`)
    return this._call(request)
  }

  public upsertV2VariantByProductId = async (productId: number, variantRequest: UpsertV2VariantRequest): Promise<V2VariantsResponse> => {
    let skuId = null;
    let sku = variantRequest.sku;
    let variant = await this.readV2Variant(productId, sku);
    if (variant && variant.length === 1) {
      skuId = variant[0].id;
    }
    delete variantRequest.id;
    return (skuId) ?
      this._updateV2Variant(productId, skuId, variantRequest) :
      this._createV2Variant(productId, variantRequest);
  }



  // VARIANTS
  // https://developer.bigcommerce.com/docs/rest-catalog/product-variants
  private _createVariant = async (productId: number, body: UpsertVariantRequest, paramsString: string = ""): Promise<VariantResponse> => {
    let request = () => this._bigcommerceClient.post(`v3/catalog/products/${productId}/variants?${paramsString}`, body)
    return this._call(request);
  }

  public readVariant = async (productId: number, sku: string, paramsString: string = ""): Promise<VariantsResponse> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/variants?sku=${sku}${paramsString}`)
    return this._retry(request);
  }

  public readVariants = async (productId: number, paramsString: string = ""): Promise<VariantsResponse> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/variants?${paramsString}`)
    return this._retry(request);
  }

  public readAllVariants = async (productId: number): Promise<Array<VariantResponseData>> => {
    let partial = (paramString: string) => { return this.readVariants(productId, paramString) }
    return this._readAll(partial);
  }

  private _updateVariant = async (productId: number, variantId: number, body: UpsertVariantRequest, paramsString: string = ""): Promise<VariantResponse> => {
    let request = () => this._bigcommerceClient.put(`v3/catalog/products/${productId}/variants/${variantId}?${paramsString}`, body)
    return this._call(request);
  }

  private _deleteVariant = async (productId: number, variantId: number, paramsString: string = "") => {
    let request = () => this._bigcommerceClient.delete(`v3/catalog/products/${productId}/variants/${variantId}?${paramsString}`)
    return this._call(request);
  }

  public upsertVariantByProductId = async (productId: number, variantRequest: UpsertVariantRequest): Promise<VariantResponse> => {
    let variantId = null;
    let sku = variantRequest.sku;
    let variant = (await this.readVariant(productId, sku))?.data;
    if (variant && variant.length === 1) {
      variantId = variant[0].id;
    }
    delete variantRequest.id;
    return (variantId) ?
      this._updateVariant(productId, variantId, variantRequest) :
      this._createVariant(productId, variantRequest);
  }

  // https://developer.bigcommerce.com/docs/rest-catalog/product-variants/images
  public uploadVariantImage = async (
    sku: string, productId: number,
    variantId: number,
    fileName: string,
    imageFile: Buffer,
    paramsString: string = ""): Promise<ImageResponse> => {

    const formData = new FormData();
    const imageInMegaBytes = Buffer.byteLength(imageFile) / 1000000.00;
    if (imageInMegaBytes < 1) {
      formData.append("image_file", imageFile, fileName);
    } else {
      const rawImageData = jpeg.decode(imageFile);
      const reEncoded = jpeg.encode(rawImageData, 95).data;
      const reEncodedInMegaBytes = Buffer.byteLength(reEncoded) / 1000000.00;
    //   utils.log(`[${sku}:${productId}:${variantId}:${fileName} was too large at ${imageInMegaBytes} MB, quality reduced to 95 for a new size of ${reEncodedInMegaBytes} MB`)
      formData.append("image_file", reEncoded, fileName);
    }
    let request = () => this._bigcommerceFormClient.post(`v3/catalog/products/${productId}/variants/${variantId}/image?${paramsString}`, formData);
    return this._call(request)
  }

// Custom Fields
  // https://developer.bigcommerce.com/docs/rest-catalog/products/custom-fields
  private _createCustomField = async (productId: number, body: UpsertCustomFieldRequest, paramsString: string = ""): Promise<CustomFieldResponse> => {
    let request = () => this._bigcommerceClient.post(`v3/catalog/products/${productId}/custom-fields?${paramsString}`, body)
    return this._call(request)
  }

  public readCustomField = async (productId: number, customFieldId: number, paramsString: string = ""): Promise<CustomFieldResponseData> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/custom-fields/${customFieldId}?${paramsString}`)
    return this._retry(request)
  }

  public readCustomFields = async (productId: number, paramsString: string = ""): Promise<CustomFieldsResponse> => {
    let request = () => this._bigcommerceClient.get(`v3/catalog/products/${productId}/custom-fields?${paramsString}`)
    return this._retry(request)
  }

  public readAllCustomFields = async (productId: number): Promise<Array<CustomFieldResponseData>> => {
    let partial = (paramString: string) => { return this.readCustomFields(productId, paramString) }
    return this._readAll(partial);
  }

  private _updateCustomField = async (productId: number, customFieldId: number, body: UpsertCustomFieldRequest, paramsString: string = ""): Promise<CustomFieldResponse> => {
    let request = () => this._bigcommerceClient.put(`v3/catalog/products/${productId}/custom-fields/${customFieldId}?${paramsString}`, body)
    return this._call(request)
  }

  public upsertCustomFieldByProductId = async (productId: number, customFieldRequest: UpsertCustomFieldRequest): Promise<CustomFieldResponseData> => {
    let id = customFieldRequest.id;
    let name = customFieldRequest.name;
    let value = customFieldRequest.value;
    let existingFields = await this.readAllCustomFields(productId);
    let existingField = existingFields.find(field => field.name === name && field.value === value); // BigCommerce is case insensitive to the key/value so this can blow up, but we want to know. (facepalm)
    let response = (existingField) ?
      { data: existingField }
      : await this._createCustomField(productId, customFieldRequest);
    return response?.data
  }


}