import { S3Handler } from 'aws-lambda';
import 'source-map-support/register';
import { getLog } from './helpers/get-log';
import { S3, SQS } from 'aws-sdk';
import { parseImportFileData } from '../data/parse-import-file-data';
import { Readable } from 'stream';
import { runInChunks } from './helpers/run-in-chunks';
import { Product } from '../data/product.interface';

const s3 = new S3();
const sqs = new SQS();
const batchSize = Number(process.env.BATCH_SIZE);

const moveToParsed = async (
  bucket: string,
  objectKey: string
): Promise<string> => {
  const newKey = objectKey.replace(/^uploaded\//, 'parsed/');
  await s3
    .copyObject({
      CopySource: `/${bucket}/${objectKey}`,
      Bucket: bucket,
      Key: newKey,
    })
    .promise();
  await s3
    .deleteObject({
      Bucket: bucket,
      Key: objectKey,
    })
    .promise();
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
    await runInChunks(
      async (next, complete) => {
        await parseImportFileData(
          readImportFileData(bucket, objectKey),
          async (product) => {
            log.info(`Product ${index}: `, { index, product });
            index++;
            await next(product);
          }
        );
        await complete();
      },
      batchSize,
      async (chunk: Product[]) => {
        const entries = chunk.map((product, index) => ({
          Id: `${index}`,
          MessageBody: JSON.stringify(product),
        }));
        const queueUrl = process.env.PRODUCTS_QUEUE_URL;

        log.info(`Sending message batch to ${queueUrl}`, { queueUrl, entries });
        await sqs
          .sendMessageBatch({
            QueueUrl: queueUrl,
            Entries: entries,
          })
          .promise();
      }
    );
    log.info('Finished reading file: ', objectKey);

    const newKey = await moveToParsed(bucket, objectKey);
    log.info('Moved to: ', newKey);
  }
};
