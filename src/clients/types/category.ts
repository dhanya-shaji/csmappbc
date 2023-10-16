import { ArrayEnvelope, CustomUrl, V3Meta } from "./shared"

export enum DefaultProductSort {
    // use_store_settings | featured | newest | best_selling | alpha_asc | alpha_desc | avg_customer_review | price_asc | price_desc
    useStoreSettings = "use_store_setting",
    featured = "featured",
    newest = "newest",
    bestSelling = "best_selling",
    alphaAsc = "alpha_asc",
    alphaDesc = "alpha_desc",
    avgCustomerReview = "avg_customer_review",
    priceAsc = "price_asc",
    priceDesc = "price_desc"
 }
 
 export type CategoryResponseData = {
     id: number,
     parent_id: number,
     name: string,
     description: string,
     views: number,
     sort_order: number,
     page_title: string,
     meta_keywords: Array<string>,
     meta_description: string,
     layout_file: string,
     image_url: string,
     is_visible: boolean,
     search_keywords: string,
     default_product_sort: DefaultProductSort,
     custom_url: CustomUrl
 }

 export class CategoriesResponse implements ArrayEnvelope<CategoryResponseData> {
    data: Array<CategoryResponseData>;
    meta: V3Meta
}