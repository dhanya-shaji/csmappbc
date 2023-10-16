import { ArrayEnvelope, CustomUrl, Envelope, V3Meta } from "./shared";

export class SlimProductsResponse implements ArrayEnvelope<SlimProductResponseData> {
    data: Array<SlimProductResponseData>;
    meta: V3Meta;

    constructor(data: Array<SlimProductResponseData>, meta: V3Meta) {
        this.data = data;
        this.meta = meta;
    }
}


export type ProductResponseData = {
    id: number,
    name: string,
    type: ProductType,
    sku: string,
    description: string,
    weight: number,
    width: number,
    depth: number,
    height: number,
    price: number,
    cost_price: number,
    retail_price: number,
    sale_price: number,
    map_price: number,
    tax_class_id: number,
    product_tax_code: string,
    categories: Array<number>,
    brand_id: number,
    brand_name: string,
    inventory_level: number,
    inventory_warning_level: number,
    inventory_tracking: InventoryTracking,
    fixed_cost_shipping_price: number,
    is_free_shipping: boolean,
    is_visible: boolean,
    is_featured: boolean,
    related_products: Array<number>,
    warranty: string,
    bin_picking_number: string,
    layout_file: string,
    upc: string,
    search_keywords: string,
    availability_description: string,
    availability: Availability,
    gift_wrapping_options_type: GiftWrappingOptionsType,
    gift_wrapping_options_list: Array<number>,
    sort_order: number,
    condition: Condition,
    is_condition_shown: boolean,
    order_quantity_minimum: number,
    order_quantity_maximum: number,
    page_title: string,
    meta_keywords: Array<string>,
    meta_description: string,
    view_count: number,
    preorder_release_date: Date,
    preorder_message: string,
    is_preorder_only: boolean,
    is_price_hidden: boolean,
    price_hidden_label: string,
    custom_url: CustomUrl,
    open_graph_type: OpenGraphType,
    open_graph_title: string,
    open_graph_description: string,
    open_graph_use_meta_description: boolean,
    open_graph_use_product_name: boolean,
    open_graph_use_image: boolean,
    gtin: string,
    mpn: string,
    reviews_rating_sum: number,
    reviews_count: number,
    total_sold: number,
    custom_fields: Array<CustomField>,
    bulk_pricing_rules: Array<BulkPricingRule>,
    images: Array<Image>,
    videos: Array<Video>,
    date_created: Date,
    date_modified: Date,
    base_variant_id: number,
    calculated_price: number,
    options: Array<Option>
    modifiers: Array<Modifier>,
    option_set_id: number,
    option_set_display: string,
    variants: Array<Variant>,
}

export interface VariantOptionValue {
    option_display_name: string;
    label: string;
    id: number;
    option_id: number;
}

export type Variant = {
    cost_price: number,
    price: number,
    sale_price: number,
    retail_price: number,
    weight: number,
    width: number,
    height: number,
    depth: number,
    is_free_shipping: boolean,
    fixed_cost_shipping_price: number,
    purchasing_disabled: boolean,
    purchasing_disabled_message: string,
    upc: string,
    inventory_level: number,
    inventory_warning_level: number,
    bin_picking_number: string,
    mpn: string,
    gtin: string,
    id: number,
    product_id: number,
    sku: string,
    sku_id: number,
    option_values: Array<VariantOptionValue>,
    calculated_price: number,
    calculated_weight: number
}

export type CustomField = {
    id: number,
    name: string,
    value: string
}
export type OptionConfig = {
    default_value: string,
    checked_by_default: boolean,
    checkbox_label: string,
    date_limited: boolean,
    date_limit_mode: DateLimitMode,
    date_earliest_value: Date,
    date_latest_value: Date,
    file_types_mode: FileTypesMode,
    file_types_supported: Array<string>,
    file_types_other: Array<string>,
    file_max_size: number,
    text_characters_limited: boolean,
    text_min_length: number,
    text_max_length: number,
    text_lines_limited: boolean,
    text_max_lines: number,
    number_limited: boolean,
    number_limit_mode: NumberLimitMode,
    number_lowest_value: number,
    number_highest_value: number,
    number_integers_only: boolean,
    product_list_adjusts_inventory: boolean,
    product_list_adjusts_pricing: boolean,
    product_list_shipping_calc: ProductListShippingCalc
}

export enum FileTypesMode {
    specific = "specific",
    all = "all"
}

export enum DateLimitMode {
    earliest = "earliest",
    range = "range",
    latest = "latest"
}

export type ModifierConfig = {
    default_value: string,
    checked_by_default: boolean,
    checkbox_label: string,
    date_limited: boolean,
    date_limit_mode: DateLimitMode,
    date_earliest_value: Date,
    date_latest_value: Date,
    file_types_mode: FileTypesMode,
    file_types_supported: Array<string>,
    file_types_other: Array<string>,
    file_max_size: number,
    text_characters_limited: boolean,
    text_min_length: number,
    text_max_length: number,
    text_lines_limited: boolean,
    text_max_lines: number,
    number_limited: boolean,
    number_limit_mode: string,
    number_lowest_value: number,
    number_highest_value: number,
    number_integers_only: boolean,
    product_list_adjusts_inventory: boolean,
    product_list_adjusts_pricing: boolean,
    product_list_shipping_calc: ProductListShippingCalc
}
export enum ProductListShippingCalc {
    none = "none",
    weight = "weight",
    package = "package"
}
export type Modifier = {
    id: number,
    type: string,
    required: boolean,
    sort_order: number,
    config: ModifierConfig,
    display_name: string,
    product_id: number,
    name: string,
    option_values: [
        {
            id: number,
            option_id: number,
            is_default: boolean,
            label: string,
            sort_order: number,
            value_data: object,
            adjusters: OptionValueAdjusters
        }
    ]
}



export type Option = {
    id: number,
    product_id: number,
    display_name: string,
    type: OptionType,
    config: OptionConfig,
    sort_order: number,
    option_values: Array<OptionValue>
}

export enum OptionType {
    radio_buttons = "radio_buttons",
    rectangles = "rectangles",
    dropdown = "dropdown",
    product_list = "product_list",
    product_list_with_images = "product_list_with_images",
    swatch = "swatch"
}
export enum NumberLimitMode {
    lowest = "lowest",
    highest = "highest",
    range = "range"
}

export type OptionValue = {
    is_default: boolean,
    label: string,
    sort_order: number,
    value_data: Object,
    id: number
}

export enum Adjuster {
    relative = "relative",
    absolute = "absolute"
}

export type OptionValueAdjusterPrice = {
    adjuster: Adjuster,
    adjuster_value: number
}

export type OptionValueAdjusterWeight = {
    adjuster: Adjuster,
    adjuster_value: number
}

export type OptionValueAdjusterPurchasingDisabled = {
    status: boolean,
    message: string
}

export type OptionValueAdjusters = {
    price: OptionValueAdjusterPrice,
    weight: OptionValueAdjusterWeight,
    image_url: string,
    purchasing_disabled: OptionValueAdjusterPurchasingDisabled
}


export type Image = {
    image_file: string,
    is_thumbnail: boolean,
    sort_order: number,
    description: string,
    image_url: string,
    id: number,
    product_id: number,
    url_zoom: string,
    url_standard: string,
    url_thumbnail: string,
    url_tiny: string,
    date_modified: Date
}

export enum VideoType {
    youtube = "youtube"
}

export type Video = {
    title: string,
    description: string,
    sort_order: 1,
    type: VideoType,
    video_id: string,
    id: number,
    product_id: number,
    length: string
}

export class ProductResponse implements Envelope<ProductResponseData> {
    data!: ProductResponseData;
    meta!: V3Meta;
    

}
export type SlimProductResponseData = {
    id: number,
    name: string,
    sku: string,
    brand_id: number,
    is_visible: boolean
}

export enum ProductType {
    physical = "physical",
    digital = "digital"
}
export enum InventoryTracking {
    none = "none",
    product = "product",
    variant = "variant"
}
export enum Availability {
    available = "available",
    disabled = "disable",
    preorder = "preorder"
}

export enum GiftWrappingOptionsType {
    any = "any",
    none = "none",
    list = "list"
}

export enum Condition {
    New = "New",
    Used = "Used",
    Refurbished = "Refurbished"
}

export enum OpenGraphType {
    product = "product",
    album = "album", // this was prefixed with a space, was that typo?
    book = "book",
    drink = "drink",
    food = "food",
    game = "game",
    movie = "movie",
    song = "song",
    tvShow = "tv_show"
}

export type BulkPricingRule = {
    quantity_min: number,
    quantity_max: number,
    type: string,
    amount: number
}

export interface UpsertProductRequest {
    id?: number;
    name: string;
    type: ProductType;
    sku: string;
    description?: string;
    weight: number;
    width?: number;
    depth?: number;
    height?: number;
    price: number;
    cost_price?: number;
    retail_price?: number;
    sale_price?: number;
    map_price?: number;
    tax_class_id?: number;
    product_tax_code?: string;
    categories?: Array<any>;
    brand_id?: number; //OR 
    brand_name?: string;
    inventory_level?: number;
    inventory_warning_level?: number;
    inventory_tracking?: InventoryTracking;
    fixed_cost_shipping_price?: number;
    is_free_shipping?: boolean;
    is_visible?: boolean;
    is_featured?: boolean;
    related_products?: Array<number>;
    warranty?: string;
    bin_picking_number?: string;
    layout_file?: string;
    upc?: string;
    search_keywords?: string;
    availability_description?: string;
    availability?: Availability;
    gift_wrapping_options_type?: GiftWrappingOptionsType;
    gift_wrapping_options_list?: Array<number>;
    sort_order?: number;
    condition?: Condition;
    is_condition_shown?: boolean;
    order_quantity_minimum?: number;
    order_quantity_maximum?: number;
    page_title?: string;
    meta_keywords?: Array<string>;
    meta_description?: string;
    view_count?: number;
    preorder_release_date?: Date;
    preorder_message?: string;
    is_preorder_only?: boolean;
    is_price_hidden?: boolean;
    price_hidden_label?: string;
    custom_url?: CustomUrl;
    open_graph_type?: OpenGraphType;
    open_graph_title?: string;
    open_graph_description?: string;
    open_graph_use_meta_description?: boolean;
    open_graph_use_product_name?: boolean;
    open_graph_use_image?: boolean;
    gtin?: string;
    mpn?: string;
    reviews_rating_sum?: number;
    reviews_count?: number;
    total_sold?: number;
    bulk_pricing_rules?: Array<BulkPricingRule>;
    
}

