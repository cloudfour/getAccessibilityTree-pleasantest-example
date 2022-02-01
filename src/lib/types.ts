export interface Product {
  name: string;
  price: number;
  id: number | string;
}

export interface CartItemData {
  product: Product;
  quantity: number;
}
