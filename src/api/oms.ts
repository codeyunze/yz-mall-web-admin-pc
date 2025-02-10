import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { ResultTable } from "./type";

/** 订单信息-分页查询 */
export const omsOrderPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/oms/order/page"), {
    data
  });
};
