import { jsonResult } from '../helpers/json-result';
import { ValidatorResult } from 'jsonschema';

export const cannotImportFileError = (filename:string) =>
  jsonResult(
    {
      message: `Cannot import file "${filename}"`,
    },
    500
  );
