import { jsonResult } from "../helpers/json-result";

export const productNotFoundError = (productId: string) =>
  jsonResult(`No such product - ${productId}`, 404);
