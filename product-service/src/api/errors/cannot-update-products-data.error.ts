import { jsonResult } from '../helpers/json-result';

export const cannotUpdateProductsDataError = () =>
  jsonResult(
    {
      message: 'Cannot update products data',
    },
    500
  );
