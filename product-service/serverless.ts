import Aws, { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'rsaosin-candies-product-service',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    'serverless-offline': {
      httpPort: 4000,
    },
    productsQueueName: 'rsaosin-candies-products-queue-${self:provider.stage}',
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
      CREATE_PRODUCT_TOPIC: { Ref: 'CreateProductTopic' },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: [{ 'Fn::GetAtt': ['ProductsQueue', 'Arn'] }],
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: [{ Ref: 'CreateProductTopic' }],
      },
    ],
  },
  functions: {
    getProducts: {
      handler: 'handler.getProducts',
      events: [
        {
          http: {
            method: 'get',
            path: 'product/available',
            cors: true,
          },
        },
      ],
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'product/{productId}',
            cors: true,
            request: {
              parameters: {
                paths: {
                  productId: true,
                },
              },
            },
          },
        },
      ],
    },
    postProduct: {
      handler: 'handler.postProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'product',
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: { 'Fn::GetAtt': ['ProductsQueue', 'Arn'] },
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      ProductsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:custom.productsQueueName}',
          ReceiveMessageWaitTimeSeconds: 20,
        },
      },
      CreateProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName:
            '${self:service}-create-product-topic-${self:provider.stage}',
          DisplayName: 'Products created',
          Subscription: [
            {
              Protocol: 'email',
              Endpoint: '${env:PRODUCTS_CREATED_EMAIL}',
            },
          ],
        },
      },
    },
    Outputs: {
      ProductsQueueName: {
        Value: { 'Fn::GetAtt': ['ProductsQueue', 'QueueName'] },
      },
      ProductsQueueArn: {
        Value: { 'Fn::GetAtt': ['ProductsQueue', 'Arn'] },
      },
      ProductsQueueUrl: {
        Value: { Ref: 'ProductsQueue' },
      },
    },
  },
};

module.exports = serverlessConfiguration;
