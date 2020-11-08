# product-service

Microservice for product related information.

## npm scripts

```sh
# deploy to AWS:
yarn run deploy

# initialize database and upload product list:
yarn run init

# upload product list:
yarn run upload-product-list
```

## secrets

Secrets are stored in `.env` file. Before running any scripts, copy `.env.example` file to `.env` and edit the database connection parameters.
