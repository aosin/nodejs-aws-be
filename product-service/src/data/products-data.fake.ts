import productList from './productList.json';
import { Product } from './product.interface';

const products = productList as Product[];

export class ProductsData {
  async getAll(): Promise<Product[]> {
    return products;
  }
  async getById(id: string): Promise<Product | null> {
    return products.find((product) => product.id === id) || null;
  }
}
