import { SQSHandler } from 'aws-lambda';
import { getLog } from './helpers/get-log';

export const catalogBatchProcess: SQSHandler = async (event, context) => {
  const { log, logCall } = getLog(event, context);
  logCall();
};
