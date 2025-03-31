import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { Result, ResultTable } from "./type";

export type OmsOrder = {
  /**
   * 订单类型：0正常订单；1秒杀订单
   */
  orderType: number;
  /**
   * 收货人姓名
   */
  receiverName: string;
  /**
   * 收货人手机号
   */
  receiverPhone: string;
  /**
   * 收货省
   */
  receiverProvince: string;
  /**
   * 收货市
   */
  receiverCity: string;
  /**
   * 收货区
   */
  receiverDistrict: string;
  /**
   * 收货详细地址
   */
  receiverAddress: string;
  /**
   * 订单消息接收邮箱
   */
  email: string;
  /**
   * 订单备注
   */
  note: string;
  /**
   * 订单商品
   */
  products: Array<OmsOrderProduct>;
};

export type OmsOrderProduct = {
  /**
   * 商品Id
   */
  productId: string;
  /**
   * 商品数量
   */
  productQuantity: number;
};

/** 订单信息-分页查询 */
export const omsOrderPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/oms/order/page"), {
    data
  });
};

/** 取消订单 */
export const omsOrderCancel = (data?: object) => {
  return http.request<ResultTable>(
    "post",
    baseUrlApi(`/oms/order/cancel/${data}`)
  );
};

/** 生成订单 */
export const omsOrderGeneral = (data?: OmsOrder) => {
  return http.request<Result>("post", baseUrlApi("/oms/order/generate"), {
    data
  });
};
