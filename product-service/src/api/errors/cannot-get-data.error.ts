import { jsonResult } from '../helpers/json-result'

export const cannotGetProductsDataError = () =>
  jsonResult(
    {
      message: 'Cannot get products data',
    },
    500,
  )
