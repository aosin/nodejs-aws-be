import { jsonResult } from '../helpers/json-result';

export const productNotFoundError = (productId: string) =>
  jsonResult(
    {
      message: `No such product - ${productId}`,
    },
    404
  );
