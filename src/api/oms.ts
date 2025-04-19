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

/**
 * 查询过滤条件
 */
export type OmsOrderQuerySlim = {
  /**
   * 订单编号: 省市区年月日000001
   */
  orderCode: string;
  /**
   * 订单Id
   */
  orderId?: string;
};

/**
 * 订单详情
 */
export type OmsDetailResult = {
  code: number;
  success: boolean;
  data?: OmsOrderDetail;
  msg: string;
};

export type OmsOrderDetail = {
  /**
   * 订单主键标识
   */
  id: number;
  /**
   * 订单编号;省市区年月日000001
   */
  orderCode: number;
  /**
   * 订单状态：0待付款；1待发货；2已发货；3待收货；4已完成；5已关闭/已取消/已取消；6无效订单
   */
  orderStatus: number;
  /**
   * 订单类型：0正常订单；1秒杀订单
   */
  orderType: number;
  /**
   * 订单总金额
   */
  totalAmount: number;
  /**
   * 优惠金额
   */
  discountAmount: number;
  /**
   * 订单实际应付金额
   */
  payAmount: number;
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
   * 订单创建时间
   */
  createTime: string;
  /**
   * 确认收货时间
   */
  receiveTime: string;
  /**
   * 支付方式：0未支付/待支付；1支付宝；2微信
   */
  payType: number;
  /**
   * 收货状态：0未确认收货；1已确认收货
   */
  confirmStatus: number;
  /**
   * 订单备注
   */
  note: string;
  /**
   * 订单商品
   */
  products: Array<OmsOrderProductDetail>;
};

export type OmsOrderProductDetail = {
  /**
   * 订单与产品关联数据主键标识
   */
  id: number;

  /**
   * 订单id
   */
  orderId: number;

  /**
   * 商品id
   */
  productId: number;

  /**
   * 购买商品数量
   */
  productQuantity: number;

  /**
   * 商品优惠金额
   */
  discountAmount: number;

  /**
   * 商品优惠后的实际价格
   */
  realAmount: number;

  /**
   * 商品属性;[{key:颜色,value:黑色},{key:内存,value:32G}]
   */
  productAttributes: string;

  /**
   * 商品名称
   */
  productName: string;

  /**
   * 商品价格(下单时商品的价格)
   */
  productPrice: number;

  /**
   * 商品备注信息
   */
  remark: string;
};

export type OmsOrderPay = {
  /**
   * 业务Id
   */
  businessId: number;
  /**
   * 支付方式：1支付宝；2微信
   */
  payType: number;
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

/** 获取订单详情 */
export const getOmsInfo = (data?: OmsOrderQuerySlim) => {
  return http.request<OmsDetailResult>("post", baseUrlApi("/oms/order/get"), {
    data
  });
};

/** 订单支付 */
export const omsPay = (data?: OmsOrderPay) => {
  return http.request<Result>("post", baseUrlApi("/oms/pay"), {
    data
  });
};
