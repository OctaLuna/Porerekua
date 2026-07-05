export interface GeoRefRequest {
    lat: number;
    lng: number;
}

export interface GeoRefResponse {
    found: boolean;
    lat: number;
    lng: number;
    department: string | null;
    municipality: string | null;
    country: string;
}

export interface GeoRefHealthResponse {
    status: string;
    environment: string;
    features_loaded: number;
    geojson_path: string;
}
