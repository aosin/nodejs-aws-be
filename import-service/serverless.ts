import type { Serverless } from 'serverless/aws';
import * as Aws from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'rsaosin-candies-import-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    'serverless-offline': {
      httpPort: 4000,
    },
    s3BucketName: 'rsaosin-candies-import-${self:provider.stage}',
    productServiceStackName:
      'rsaosin-candies-product-service-${self:provider.stage}',
    productsQueueArn:
      '${cf:${self:custom.productServiceStackName}.ProductsQueueArn}',
    productsQueueUrl:
      '${cf:${self:custom.productServiceStackName}.ProductsQueueUrl}',
    authorizationServiceStackName:
      'rsaosin-candies-authorization-service-${self:provider.stage}',
    basicAuthorizerArn:
      '${cf:${self:custom.authorizationServiceStackName}.BasicAuthorizerArn}',
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
      shouldStartNameWithService: true,
    } as Aws.ApiGateway & any,
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      IMPORT_SERVICE_BUCKET: '${self:custom.s3BucketName}',
      PRODUCTS_QUEUE_URL: '${self:custom.productsQueueUrl}',
      BATCH_SIZE: 5,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: ['arn:aws:s3:::${self:custom.s3BucketName}/*'],
      },
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: ['arn:aws:s3:::${self:custom.s3BucketName}'],
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: ['${self:custom.productsQueueArn}'],
      },
    ],
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
            cors: true,
            authorizer: {
              name: 'basicAuthorizer',
              arn: '${self:custom.basicAuthorizerArn}',
              type: 'TOKEN',
              identitySource: 'method.request.header.Authorization',
              identityValidationExpression: 'Basic (.*)',
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: '${self:custom.s3BucketName}',
            event: 's3:ObjectCreated:*',
            rules: [
              ({ prefix: 'uploaded/' } as Partial<Aws.S3Rule>) as any,
              ({ suffix: '.csv' } as Partial<Aws.S3Rule>) as any,
            ],
            existing: true,
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
      GatewayResponseDefault5XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_5XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
      GatewayResponseUnauthorized: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
            'gatewayresponse.header.WWW-Authenticate':
              '\'Basic realm="import-service"\'',
          },
          ResponseType: 'UNAUTHORIZED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
