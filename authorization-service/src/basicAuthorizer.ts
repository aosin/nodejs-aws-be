import {
  APIGatewayTokenAuthorizerHandler,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';
import 'source-map-support/register';

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async (
  event,
  _context
): Promise<APIGatewayAuthorizerResult> => {
  console.log('In basicAuthorizer:', event);
  try {
    const token = event.authorizationToken;
    const encodedCreds = token.replace(/^Basic (.*)/, '$1');
    const [user, password] = Buffer.from(encodedCreds, 'base64')
      .toString()
      .split(':');
    console.log('Got creds: ', user, password);
    const storedPassword = process.env[`PASSWORD_${user}`];
    console.log('Got stored password:', storedPassword);
    const effect =
      storedPassword && storedPassword === password ? 'Allow' : 'Deny';
    console.log('Effect: ', effect);

    return {
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: event.methodArn,
          },
        ],
      },
      principalId: encodedCreds,
    };
  } catch (err) {
    throw new Error(`Authorization failed: ${err.message}`);
  }
};
