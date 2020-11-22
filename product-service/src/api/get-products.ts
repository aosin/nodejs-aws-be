import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { ProductsData } from '../data/products-data';
import { jsonResult } from './helpers/json-result';
import { cannotGetProductsDataError } from './errors/cannot-get-data.error';
import { getLog } from './helpers/get-log';

export const getProducts: APIGatewayProxyHandler = async (event, context) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  try {
    const productsData = new ProductsData();
    const products = await productsData.getAll();

    return jsonResult(products);
  } catch (error) {
    log.error(error);
    return cannotGetProductsDataError();
  }
};
