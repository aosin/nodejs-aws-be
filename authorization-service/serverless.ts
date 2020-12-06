import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'rsaosin-candies-authorization-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: [
    'serverless-webpack',
    'serverless-offline',
    'serverless-dotenv-plugin',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    basicAuthorizer: {
      handler: 'handler.basicAuthorizer',
    },
  },
  resources: {
    Resources: {},
    Outputs: {
      BasicAuthorizerArn: {
        Value: { 'Fn::GetAtt': ['BasicAuthorizerLambdaFunction', 'Arn'] },
      },
    },
  },
};

module.exports = serverlessConfiguration;
