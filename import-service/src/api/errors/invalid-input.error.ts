import { jsonResult } from '../helpers/json-result';
import { ValidatorResult } from 'jsonschema';

export const invalidInputError = (validationResult: ValidatorResult) =>
  jsonResult(
    {
      message: 'Invalid input',
      errors: validationResult.errors.map((error) => error.toString()),
    },
    400
  );
