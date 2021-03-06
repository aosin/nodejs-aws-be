import { Context } from 'aws-lambda';
import { LambdaLog } from 'lambda-log';

export const getLog = (event: any, context: Context): LambdaLog => {
  const log = new LambdaLog();
  log.options.meta.event = event;
  const logCall = () => log.info(context.functionName);
  return { log, logCall };
};
