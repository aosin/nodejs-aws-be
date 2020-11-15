import { Product } from './product.interface';
import { Readable } from 'stream';
import * as csv from 'csv-parser';

export const parseImportFileData = <T>(
  stream: Readable,
  reducer: (data: Product, acc?: T) => T,
  init?: T
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let result = init;
    stream
      .pipe(csv(['id', 'title', 'description', 'price', 'count', 'imageUrl']))
      .on('data', (data) => {
        result = reducer(data, result);
      })
      .on('end', () => resolve(result))
      .on('error', (err) => reject(err));
  });
};
