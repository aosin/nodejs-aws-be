import { jsonResult } from '../helpers/json-result';

export const cannotParseProductError = (data: any) =>
  jsonResult(
    {
      message: 'Cannot parse product',
      data,
    },
    400
  );
