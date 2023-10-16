import { ArrayEnvelope, Envelope, V3Meta } from "./shared"


export type CustomFieldResponseData = {
    id: number,
    name: string,
    value: string
}

export class UpsertCustomFieldRequest {
    id?: number;
    name: string;
    value: string;
}

export class CustomFieldsResponse implements ArrayEnvelope<CustomFieldResponseData> {
    data: Array<CustomFieldResponseData>;
    meta: V3Meta;
}

export class CustomFieldResponse implements Envelope<CustomFieldResponseData> {
    data: CustomFieldResponseData;
    meta: V3Meta;
}