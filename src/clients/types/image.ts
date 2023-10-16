import { ArrayEnvelope,Envelope,V3Meta } from "./shared";

export type ImageResponseData = {
    id: number;
    product_id: number;
    is_thumbnail: boolean;
    file_name: string;
    sort_order: number;
    description: string;
    image_file: string;
    url_zoom: string;
    url_standard: string;
    url_thumbnail: string;
    url_tiny: string;
    date_modified: Date;
}
export class ImagesResponse implements ArrayEnvelope<ImageResponseData> {
    data: Array<ImageResponseData>;
    meta: V3Meta;

    constructor(data: Array<ImageResponseData>, meta: V3Meta) {
        this.data = data;
        this.meta = meta;
    }

}
export type UpsertImageRequest= {
    id?: number;
    product_id?: number;
    file_name?: string;
    image_file?: Buffer;
    is_thumbnail?: boolean;
    sort_order?: number;
    description?: string;
}


export class UpsertVariantImageRequest {
    product_id: number;
    variant_id: number;
    image_file?: Buffer;
}


export class ImageResponse implements Envelope<ImageResponseData> {
    data: ImageResponseData;
    meta: V3Meta;
}
