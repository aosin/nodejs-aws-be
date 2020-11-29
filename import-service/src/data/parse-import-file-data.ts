import { Product } from './product.interface';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { validate } from 'jsonschema';

const productSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
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

const removeEmptyFields = (obj: object) =>
  Object.entries(obj)
    .filter(([, value]) => value != null && value !== '')
    .reduce((result, [key, value]) => ((result[key] = value), result), {});

export const parseImportFileData = <T>(
  stream: Readable,
  reducer: (product: Product, acc?: T) => Promise<T>,
  init?: T
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let result = init;
    let line = 1;
    stream
      .pipe(csv())
      .on('data', async (data) => {
        line += 1;

        const product = removeEmptyFields({
          ...data,
          count: Number(data.count),
          price: Number(data.price),
        }) as Product;

        const validationResult = validate(product, productSchema);
        if (!validationResult.valid) {
          throw new Error(
            `Error in CSV (${line}): ${validationResult.toString()}`
          );
        }

        stream.pause();
        result = await reducer(product, result);
        stream.resume();
      })
      .on('end', () => resolve(result))
      .on('error', (err) => reject(err));
  });
};
