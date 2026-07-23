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
   * SKU Id（必填，交易按 SKU 计价与扣库存）
   */
  skuId: string;
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
   * 收货省
   */
  receiverProvinceName: string;
  /**
   * 收货市
   */
  receiverCityName: string;
  /**
   * 收货区
   */
  receiverDistrictName: string;
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
   * 订单支付时间
   */
  payTime: string;
  /**
   * 发货时间
   */
  deliveryTime: string;
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
   * 下单SKU Id
   */
  skuId?: number | string;

  /**
   * SKU编码快照
   */
  skuCode?: string;

  /**
   * SKU名称快照
   */
  skuName?: string;

  /**
   * 购买商品数量
   */
  productQuantity: number;

  /**
   * 已退款数量
   */
  refundQuantity?: number;

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

  /**
   * 商品预览地址
   */
  previewAddress: string;
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

export type GenerateOrderResult = {
  code: number;
  success: boolean;
  data?: GenerateOrderVo;
  msg: string;
};

export type GenerateOrderVo = {
  /**
   * 订单id
   */
  id: number;
  /**
   * 订单编号
   */
  orderCode: string;
};

/** 订单信息-我的订单-分页查询 */
export const omsOrderMinePage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/oms/order/mine/page"), {
    data
  });
};

/** 订单信息-订单管理-分页查询 */
export const omsOrderMgrPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/oms/order/mgr/page"), {
    data
  });
};

/** 取消订单（我的订单-待付款） */
export const omsOrderCancel = (id: string | number) => {
  return http.request<Result>(
    "post",
    baseUrlApi(`/oms/order/mine/cancel/${id}`)
  );
};

/** 取消订单（管理端） */
export const omsOrderMgrCancel = (id: string | number) => {
  return http.request<Result>(
    "post",
    baseUrlApi(`/oms/order/mgr/cancel/${id}`)
  );
};

/** 生成订单 */
export const omsOrderGeneral = (data?: OmsOrder) => {
  return http.request<GenerateOrderResult>(
    "post",
    baseUrlApi("/oms/order/mine/generate"),
    {
      data
    }
  );
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

/** 申请退款 */
export type OmsRefundApply = {
  orderId: string | number;
  reasonType?: number;
  reason: string;
};

/** 退款审核 */
export type OmsRefundAudit = {
  refundId: string | number;
  pass: boolean;
  auditRemark?: string;
};

/** 用户申请退款 */
export const omsRefundApply = (data: OmsRefundApply) => {
  return http.request<Result>(
    "post",
    baseUrlApi("/oms/order/mine/refund/apply"),
    {
      data
    }
  );
};

/** 我的退款单分页 */
export const omsRefundMinePage = (data?: object) => {
  return http.request<ResultTable>(
    "post",
    baseUrlApi("/oms/order/mine/refund/page"),
    { data }
  );
};

/** 管理端退款审核分页 */
export const omsRefundMgrPage = (data?: object) => {
  return http.request<ResultTable>(
    "post",
    baseUrlApi("/oms/order/mgr/refund/page"),
    { data }
  );
};

/** 管理端审核退款 */
export const omsRefundAudit = (data: OmsRefundAudit) => {
  return http.request<Result>(
    "post",
    baseUrlApi("/oms/order/mgr/refund/audit"),
    {
      data
    }
  );
};
