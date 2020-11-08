import { APIGatewayProxyResult } from 'aws-lambda';

export const jsonResult = (
  body: any,
  statusCode: number = 200,
  headers?: { [key: string]: string }
): APIGatewayProxyResult => ({
  body: JSON.stringify(body, null, 2),
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    ...headers,
  },
});
