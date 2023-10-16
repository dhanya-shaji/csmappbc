import { type } from "os";
import { DateLimitMode, FileTypesMode, NumberLimitMode, OptionConfig, OptionType, OptionValue, ProductListShippingCalc } from "./products";
import { ArrayEnvelope, Envelope, V3Meta } from "./shared";

export type UpsertOptionConfigRequest= {
    default_value?: string;
    checked_by_default?: boolean;
    checkbox_label?: string;
    date_limited?: boolean;
    date_limit_mode?: DateLimitMode;
    date_earliest_value?: Date;
    date_latest_value?: Date;
    file_types_mode?: FileTypesMode;
    file_types_supported?: Array<string>;
    file_types_other?: Array<string>;
    file_max_size?: number;
    text_characters_limited?: boolean;
    text_min_length?: number;
    text_max_length?: number;
    text_lines_limited?: boolean;
    text_max_lines?: number;
    number_limited?: boolean;
    number_limit_mode?: NumberLimitMode;
    number_lowest_value?: number;
    number_highest_value?: number;
    number_integers_only?: boolean;
    product_list_adjusts_inventory?: boolean;
    product_list_adjusts_pricing?: boolean;
    product_list_shipping_calc?: ProductListShippingCalc
}

export type UpsertOptionValueRequest ={
    id?: number;
    is_default?: boolean;
    label: string;
    sort_order: number;
    value_data?: object;
}

export type OptionResponseData = {
    id: number,
    product_id: number,
    display_name: string,
    type: OptionType,
    config: OptionConfig,
    sort_order: number,
    option_values: Array<OptionValue>
}

export type UpsertOptionRequest ={
    id?: number;
    product_id: number;
    display_name: string;
    type: OptionType;
    config?: UpsertOptionConfigRequest;
    sort_order?: number;
    option_values: Array<UpsertOptionValueRequest>
}

export class OptionsResponse implements ArrayEnvelope<OptionResponseData> {
    data: Array<OptionResponseData>;
    meta: V3Meta;
}

export class OptionResponse implements Envelope<OptionResponseData> {
    data: OptionResponseData;
    meta: V3Meta;
}
