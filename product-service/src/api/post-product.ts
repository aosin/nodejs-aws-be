import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { validate } from 'jsonschema';
import { ProductsData } from '../data/products-data';
import { jsonResult } from './helpers/json-result';
import { getLog } from './helpers/get-log';
import { cannotUpdateProductsDataError } from './errors/cannot-update-products-data.error';
import { Product } from '../data/product.interface';
import { cannotParseProductError } from './errors/cannot-parse-product.error';
import { invalidInputError } from './errors/invalid-input.error';

const productSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
    },
    description: {
      type: ['string', 'null'],
    },
    count: {
      type: 'number',
      minimum: 0,
    },
    price: {
      type: 'number',
      minimum: 0,
      maximum: 999999999.99,
    },
    imageUrl: {
      type: ['string', 'null'],
      format: 'uri',
    },
  },
  required: ['title', 'price', 'count'],
};

export const postProduct: APIGatewayProxyHandler = async (event, context) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  let product: Product;
  const data = event.body;
  try {
    product = JSON.parse(data);
    const validationResult = validate(product, productSchema);
    if (!validationResult.valid) {
      log.error(validationResult.toString());
      return invalidInputError(validationResult);
    }
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
