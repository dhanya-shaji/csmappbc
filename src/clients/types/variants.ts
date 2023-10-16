import { VariantOptionValue } from "./product"
import { ArrayEnvelope, Envelope, V3Meta } from "./shared"


export class UpsertVariantOptionValue {
    option_display_name: string;
    label: string;
    id?: number;
    option_id: number;
}

export type VariantResponseData = {
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

export type UpsertVariantRequest= {
    id?: number;
    cost_price?: number;
    price?: number;
    sale_price?: number;
    retail_price?: number;
    weight?: number;
    width?: number;
    height?: number;
    depth?: number;
    is_free_shipping?: boolean;
    fixed_cost_shipping_price?: number;
    purchasing_disabled?: boolean;
    purchasing_disabled_message?: string;
    upc?: string;
    inventory_level?: number;
    inventory_warning_level?: number;
    bin_picking_number?: string;
    mpn?: string;
    gtin?: string;
    product_id: number;
    sku: string;
    option_values: Array<UpsertVariantOptionValue>;
}

export class VariantsResponse implements ArrayEnvelope<VariantResponseData> {
    data: Array<VariantResponseData>;
    meta: V3Meta;
}

export class VariantResponse implements Envelope<VariantResponseData> {
    data: VariantResponseData;
    meta: V3Meta;
}
