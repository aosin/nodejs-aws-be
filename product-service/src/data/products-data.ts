import { Client } from 'pg'
import { Product } from './product.interface'

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
    const client = new Client()
    try {
      await client.connect()
      const res = await client.query(productsQuery)
      const products = res.rows.map((data) => this.parseProduct(data))
      return products
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      await client.end()
    }
  }

  async getById(id: string): Promise<Product | null> {
    const client = new Client()
    try {
      await client.connect()
      const res = await client.query(
        `${productsQuery}
        where products.id = $1`,
        [id],
      )
      if (res.rowCount === 0) {
        return null
      }
      const product = this.parseProduct(res.rows[0])
      return product
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      await client.end()
    }
  }

  private parseProduct(data: any): Product {
    return {
      ...data,
      price: data.price / 100,
    }
  }
}
