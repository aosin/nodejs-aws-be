import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { ProductsData } from '../data/products-data';
import { jsonResult } from './helpers/json-result';
import { productNotFoundError } from './errors/product-not-found.error';
import { cannotGetProductsDataError } from './errors/cannot-get-data.error';
import { getLog } from './helpers/get-log';
import { validate } from 'jsonschema';
import { invalidInputError } from './errors/invalid-input.error';

export const getProductById: APIGatewayProxyHandler = async (
  event,
  context
) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  const productId = event.pathParameters.productId;
  const validationResult = validate(
    { productId },
    {
      properties: {
        productId: {
          type: 'string',
          pattern:
            '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
        },
      },
    }
  );
  if (!validationResult.valid) {
    log.error(validationResult.toString());
    return invalidInputError(validationResult);
  }
  try {
    const productsData = new ProductsData();
    const product = await productsData.getById(productId);

    return product ? jsonResult(product) : productNotFoundError(productId);
  } catch (error) {
    log.error(error);
    return cannotGetProductsDataError();
  }
};
