import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { ResultTable, Result } from "./type";

/** 获取产品管理-商品信息 */
export const getProductPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/pms/product/page"), {
    data
  });
};

/** 产品管理-删除商品信息 */
export const deleteProduct = (data?: object) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/pms/product/delete/${data}`)
  );
};

/** 产品管理-新增商品信息 */
export const addProduct = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/product/add"), {
    data
  });
};

/** 产品管理-新增商品信息 */
export const updateProductById = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/product/update"), {
    data
  });
};

/** 产品管理-商品上架 */
export const publishProductById = (data?: object) => {
  return http.request<Result>(
    "post",
    baseUrlApi(`/pms/product/publish/${data}`)
  );
};

/** 产品管理-商品下架 */
export const delistingProductById = (data?: object) => {
  return http.request<Result>(
    "post",
    baseUrlApi(`/pms/product/delisting/${data}`)
  );
};

/** 产品管理-库存-分页查询 */
export const getStockPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/pms/stock/page"), {
    data
  });
};

/** 产品管理-库存管理-入库明细-入库 */
export const pmsProductStockIn = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/stock/add"), {
    data
  });
};

/** 产品管理-库存管理-出库明细-出库 */
export const pmsProductStockOut = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/stock/deduct"), {
    data
  });
};

/** 产品管理-库存管理-入库明细-分页查询 */
export const pmsStockInPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/pms/stock/in/page"), {
    data
  });
};

/** 产品管理-库存管理-出库明细-分页查询 */
export const pmsStockOutPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/pms/stock/out/page"), {
    data
  });
};

/** 产品管理-商品信息查询 */
export const pmsProductInfo = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/product/info"), {
    data
  });
};

/** 商品添加购物车 */
export const addCart = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/cart/add"), {
    data
  });
};

/** 购物车商品查询 */
export const getCartPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/pms/cart/page"), {
    data
  });
};

/** 购物车商品删除 */
export const deleteCart = (data?: object) => {
  return http.request<Result>("delete", baseUrlApi("/pms/cart/delete"), {
    data
  });
};

/** 商品分类-分页查询 */
export const getCategoryPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/pms/category/page"), {
    data
  });
};

/** 商品分类-查询树形结构 */
export const getCategoryTree = () => {
  return http.request<Result>("get", baseUrlApi("/pms/category/tree"));
};

/** 商品分类-根据父分类ID查询子分类列表 */
export const getCategoryListByParentId = (parentId?: number) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/pms/category/list?parentId=${parentId || 0}`)
  );
};

/** 商品分类-新增 */
export const addCategory = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/category/add"), {
    data
  });
};

/** 商品分类-更新 */
export const updateCategory = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/pms/category/update"), {
    data
  });
};

/** 商品分类-删除 */
export const deleteCategory = (id?: number) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/pms/category/delete/${id}`)
  );
};

/** 商品分类-详情查询 */
export const getCategoryDetail = (id?: number) => {
  return http.request<Result>("get", baseUrlApi(`/pms/category/get/${id}`));
};
