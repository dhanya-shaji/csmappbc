
export type V2VariantOptionValue= {
    product_option_id: number;
    option_value_id: number;
}

export type V2VariantResponseData = {
    id: number,
    product_id: number,
    sku: string,
    price: string,
    adjusted_price: string,
    cost_price: string,
    upc: string,
    inventory_level: number,
    inventory_warning_level: number,
    bin_picking_number: string,
    weight: number,
    adjusted_weight: string,
    is_purchasing_disabled: boolean,
    purchasing_disabled_message: string,
    image_file: string
}

export type UpsertV2VariantRequest ={
    id?: string;
    sku: string;
    price: string;
    cost_price?: string;
    adjusted_price?: string;
    inventory_level?: number;
    inventory_warning_level?: number;
    is_purchasing_disabled: boolean;
    options: Array<V2VariantOptionValue>;
}

export type V2VariantsResponse = Array<V2VariantResponseData>

