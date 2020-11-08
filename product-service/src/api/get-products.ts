import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { ProductsData } from "../data/products-data";
import { jsonResult } from "./helpers/json-result";
import { cannotGetProductsDataError } from "./errors/cannot-get-data.error";

export const getProducts: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const productsData = new ProductsData();
    const products = await productsData.getAll();

    return jsonResult(products);
  } catch {
    return cannotGetProductsDataError();
  }
};
