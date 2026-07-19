/**
 * 订单管理（后台）模块 —— 订单与订单行类型（与 OMS 管理端列表/详情字段对应）。
 */

/** 订单行商品（订单项） */
interface OrderProduct {
  /** 订单项主键 */
  id: string;
  /** 所属订单 ID */
  orderId: string;
  /** 商品 ID */
  productId: string;
  /** 购买数量 */
  productQuantity: number;
  /** 该行优惠金额 */
  discountAmount: number;
  /** 该行实付金额 */
  realAmount: number;
  /** SKU 属性文案 */
  productAttributes: string;
  /** 商品名称 */
  productName: string;
  /** 商品单价 */
  productPrice: number;
  /** 备注 */
  remark: string;
}

/** 订单主信息 */
interface Order {
  /** 订单主键 */
  id: string;
  /** 订单编号 */
  orderCode: string;
  /**
   * 订单状态：0 待付款；1 待发货；2 已发货；3 待收货；4 已完成；5 已取消；6 无效订单
   */
  orderStatus: number;
  /** 订单类型：0 正常订单；1 秒杀订单 */
  orderType: number;
  /** 发货时间 */
  deliveryTime: string;
  /** 收货确认状态：0 未确认；1 已确认 */
  confirmStatus: number;
  /** 确认收货时间 */
  receiveTime: string;
  /** 支付方式：0 待支付；1 支付宝；2 微信 */
  payType: number;
  /** 订单总金额 */
  totalAmount: number;
  /** 订单级优惠金额 */
  discountAmount: number;
  /** 实付金额 */
  payAmount: number;
  /** 订单备注 */
  note: string;
  /** 收货人姓名 */
  receiverName: string;
  /** 收货人手机 */
  receiverPhone: string;
  /** 省编码 */
  receiverProvince: string;
  /** 市编码 */
  receiverCity: string;
  /** 区编码 */
  receiverDistrict: string;
  /** 详细地址 */
  receiverAddress: string;
  /** 通知邮箱 */
  email: string;
  /** 订单商品行列表 */
  products?: OrderProduct[];
}

export type { Order, OrderProduct };
