const { Client } = require('pg');
const { readFileSync } = require('fs');
const pgFormat = require('pg-format');
const path = require('path');

function loadScript(filename) {
  const fullPath = path.resolve(__dirname, filename);
  console.log('Loading script: ', fullPath);
  return readFileSync(fullPath, { encoding: 'utf-8' });
}

async function createTables() {
  const client = new Client();
  try {
    const createTablesSql = loadScript('./create-tables.sql');
    console.log('Creating database tables for product-service...');
    await client.connect();
    await client.query(createTablesSql);
    console.log('Successfully created tables for product-service');
  } finally {
    await client.end();
  }
}

async function uploadProductList() {
  const client = new Client();
  try {
    const productListJson = require('./productList.json');
    const uploadProductsSql = loadScript('./upload-products.sql');
    console.log('Uploading product list...');
    await client.connect();
    await client.query(
      pgFormat(uploadProductsSql, JSON.stringify(productListJson))
    );
    console.log('Successfully uploaded product list');
  } finally {
    await client.end();
  }
}

async function init() {
  await createTables();
  await uploadProductList();
}

if (require.main === module) {
  init();
}

module.exports = {
  init,
  createTables,
  uploadProductList,
};
