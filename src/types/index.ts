export interface Asset {
  id: number;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

export interface AssetFormData {
  name: string;
  quantity: string;
  pricePerUnit: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
} 