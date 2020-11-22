import { jsonResult } from '../helpers/json-result';

export const cannotImportFileError = (filename:string) =>
  jsonResult(
    {
      message: `Cannot import file "${filename}"`,
    },
    500
  );
