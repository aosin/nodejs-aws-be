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
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: [
          'arn:aws:s3:::${self:custom.s3BucketName}/*'
        ],
      },
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: [
          'arn:aws:s3:::${self:custom.s3BucketName}'
        ],
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
};

module.exports = serverlessConfiguration;
