import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getLog } from './helpers/get-log';
import { S3 } from 'aws-sdk';
import { jsonResult } from './helpers/json-result';
import { validate } from 'jsonschema';
import { invalidInputError } from './errors/invalid-input.error';
import { cannotImportFileError } from './errors/cannot-import-file.error';

export const importProductsFile: APIGatewayProxyHandler = async (
  event,
  context
) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  const validationResult = validate(event, {
    properties: {
      queryStringParameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            pattern: '[^/.]+.csv',
          },
        },
        required: ['name'],
      },
    },
  });

  if (!validationResult.valid) {
    log.error(validationResult.toString());
    return invalidInputError(validationResult);
  }

  const filename = event.queryStringParameters.name;

  try {
    const s3 = new S3();
    var signedUrl = s3.getSignedUrl('putObject', {
      Bucket: process.env.IMPORT_SERVICE_BUCKET,
      Key: `uploaded/${filename}`,
      ContentType: 'text/csv',
      Expires: 300,
    });
  } catch (err) {
    log.error(err);
    return cannotImportFileError(filename);
  }

  return jsonResult(signedUrl);
};
