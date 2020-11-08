import { Client } from 'pg';
import { Product } from './product.interface';

const productsQuery = `
select 
  products.id as id,
  products.title as title,
  products.description as description,
  products.price as price,
  products.image_url as "imageUrl",
  stocks.count as "count"
from products as products
left join stocks as stocks
on products.id = stocks.product_id 
`;

export class ProductsData {
  async getAll(): Promise<Product[]> {
    const client = new Client();
    try {
      await client.connect();
      const res = await client.query(
        `${productsQuery} 
        where stocks.count > 0`
      );
      const products = res.rows.map((data) => this.parseProduct(data));
      return products;
    } finally {
      await client.end();
    }
  }

  async getById(id: string): Promise<Product | null> {
    const client = new Client();
    try {
      await client.connect();
      const res = await client.query(
        `${productsQuery}
        where products.id = $1`,
        [id]
      );
      if (res.rowCount === 0) {
        return null;
      }
      const product = this.parseProduct(res.rows[0]);
      return product;
    } finally {
      await client.end();
    }
  }

  async listProduct(product: Product): Promise<Product> {
    const client = new Client();
    try {
      await client.connect();
      await client.query('begin transaction');
      const productResult = await client.query(
        `insert into products (
          title,
          description,
          price,
          image_url
        ) values ($1, $2, $3, $4)
        returning id`,
        [
          product.title,
          product.description,
          Math.floor(product.price * 100),
          product.imageUrl,
        ]
      );
      const id = productResult.rows[0].id;
      await client.query(
        `insert into stocks (
          product_id,
          "count"
        ) values ($1, $2)`,
        [id, product.count]
      );
      await client.query('commit');

      const newProduct = {
        ...product,
        id,
      };
      return newProduct;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      await client.end();
    }
  }

  private parseProduct(data: any): Product {
    return {
      ...data,
      price: data.price / 100,
    };
  }
}
