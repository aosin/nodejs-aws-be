import { S3Handler } from 'aws-lambda';
import 'source-map-support/register';
import { getLog } from './api/helpers/get-log';
import { S3 } from 'aws-sdk';
import { parseImportFileData } from './data/parse-import-file-data';
import { Readable } from 'stream';

const s3 = new S3();

const moveToParsed = async (
  bucket: string,
  objectKey: string
): Promise<string> => {
  const newKey = objectKey.replace(/^uploaded\//, 'parsed/');
  await s3.copyObject({
    CopySource: `/${bucket}/${objectKey}`,
    Bucket: bucket,
    Key: newKey,
  });
  await s3.deleteObject({
    Bucket: bucket,
    Key: objectKey,
  });
  return newKey;
};

const readImportFileData = (bucket: string, objectKey: string): Readable => {
  return s3
    .getObject({
      Bucket: bucket,
      Key: objectKey,
    })
    .createReadStream();
};

export const importFileParser: S3Handler = async (event, context) => {
  const { log, logCall } = getLog(event, context);
  logCall();

  const bucket = process.env.IMPORT_SERVICE_BUCKET;
  for (const record of event.Records) {
    const objectKey = record.s3.object.key;
    let index = 0;

    log.info('Reading from file: ', objectKey);
    await parseImportFileData(readImportFileData(bucket, objectKey), (data) =>
      log.info(`Product ${++index}: `, { index, data })
    );
    log.info('Finished reading file: ', objectKey);

    const newKey = await moveToParsed(bucket, objectKey);
    log.info('Moved to: ', newKey);
  }
};
