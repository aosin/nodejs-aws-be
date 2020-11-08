import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { ProductsData } from '../data/products-data';
import { jsonResult } from './helpers/json-result';
import { productNotFoundError } from './errors/product-not-found.error';
import { cannotGetProductsDataError } from './errors/cannot-get-data.error';
import { getLog } from './helpers/get-log';

export const getProductById: APIGatewayProxyHandler = async (
  event,
  context
) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  const productId = event.pathParameters.productId;
  if (productId) {
    try {
      const productsData = new ProductsData();
      const product = await productsData.getById(productId);

      return product ? jsonResult(product) : productNotFoundError(productId);
    } catch (error) {
      log.error(error);
      return cannotGetProductsDataError();
    }
  }
};
