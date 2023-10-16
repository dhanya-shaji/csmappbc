export type V3MetaPagination = {
    total: number,
    count: number,
    per_page: number,
    current_page: number,
    total_pages: number,
    links: {
        previous: string,
        current: string,
        next: string
    }
}

export type V3Meta = {
    pagination: V3MetaPagination
}
export interface ArrayEnvelope<T> {
    data: Array<T>,
    meta: V3Meta
}
export type CustomUrl = {
    url: string,
    is_customized?: boolean
}
export interface Envelope<T> {
    data: T,
    meta: V3Meta
}