// src/components/catalog/types.ts
export type Product = {
  id: string;
  model_name: string;
  brand_slug: string;
  brand_label: string;
  category_slug: string;
  category_label: string;
  color_code: string;
  color_label: string;
  size_a?: number | string;
  size_d?: number | string;
  material?: string;
  price_ht?: number;
  price_ttc?: number;
  barcode?: string;
  title: string;
  images: string[]; // toujours un array
};
