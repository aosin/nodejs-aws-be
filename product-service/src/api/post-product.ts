import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { ProductsData } from '../data/products-data';
import { jsonResult } from './helpers/json-result';
import { getLog } from './helpers/get-log';
import { cannotUpdateProductsDataError } from './errors/cannot-update-products-data';
import { Product } from '../data/product.interface';
import { cannotParseProductError } from './errors/cannot-parse-product';

export const postProduct: APIGatewayProxyHandler = async (event, context) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  let product: Product;
  const data = event.body;
  try {
    product = JSON.parse(data);
  } catch (error) {
    log.error(error);
    return cannotParseProductError(data);
  }

  try {
    const productsData = new ProductsData();
    const newProduct = await productsData.listProduct(product);

    return jsonResult(newProduct);
  } catch (error) {
    log.error(error);
    return cannotUpdateProductsDataError();
  }
};
