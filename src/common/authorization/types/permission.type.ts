export enum ProductsPermission {
  CreateProduct = 'CreateProduct',
  UpdateProduct = 'UpdateProduct',
  DeleteProduct = 'DeleteProduct',
}

export const PERMISSION = {
  ...ProductsPermission,
};

export type IPermission = ProductsPermission;
