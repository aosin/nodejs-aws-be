import { SQSHandler } from 'aws-lambda';
import { getLog } from './helpers/get-log';
import { Product } from '../data/product.interface';
import { validate } from 'jsonschema';
import { ProductsData } from '../data/products-data';
import { SNS } from 'aws-sdk';

const sns = new SNS();

const productSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
    },
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
  additionalProperties: false,
};

export const catalogBatchProcess: SQSHandler = async (event, context) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  const created: Product[] = [];
  const updated: Product[] = [];
  for (const record of event.Records) {
    record.body;

    let product: Product;
    const data = record.body;
    try {
      product = JSON.parse(data);
      const validationResult = validate(product, productSchema);
      if (!validationResult.valid) {
        log.error(validationResult.toString());
        throw new Error('Invalid message data. See error log for details');
      }
    } catch (error) {
      log.error(error);
    }

    const productsData = new ProductsData();
    try {
      if (product.id) {
        const newProduct = await productsData.createOrUpdateProduct(product);
        updated.push(newProduct);
        log.info('Updated a product:', { product: newProduct });
      } else {
        const newProduct = await productsData.createProduct(product);
        created.push(newProduct);
        log.info('Created a new product:', { product: newProduct });
      }
    } catch (error) {
      log.error(error);
      throw error;
    }
  }

  const topicArn = process.env.CREATE_PRODUCT_TOPIC;
  log.info('Publishing to topic', { topicArn, created, updated });
  const message =
    'The following products were created or updated:\n' +
    JSON.stringify({ created, updated }, null, 2);
  await sns
    .publish({
      TopicArn: topicArn,
      Subject: 'Products created',
      Message: message,
    })
    .promise();
};
