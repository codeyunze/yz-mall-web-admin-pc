export type ReceiptInfo = {
  /**
   * 收货地址省编码
   */
  receiverProvince?: string;
  /**
   * 收货地址市编码
   */
  receiverCity?: string;
  /**
   * 收货地址区编码
   */
  receiverDistrict?: string;
  /**
   * 详细地址
   */
  receiverAddress?: string;
  /**
   * 收货人姓名
   */
  receiverName?: string;
  /**
   * 收货人手机号
   */
  receiverPhone?: string;
  /**
   * 收货人邮件
   */
  receiverEmail?: string;
  /**
   * 是否默认地址：0否；1是
   */
  isDefault?: number;
  /**
   * 省/市/区名称（展示用）
   */
  receiverProvinceName?: string;
  receiverCityName?: string;
  receiverDistrictName?: string;
};

export type ProductInfo = {
  /** 商品Id */
  productId: string;
  /** SKU Id */
  skuId?: string;
  /** SKU 名称/编码 */
  skuName?: string;
  /** 购买数量 */
  quantity: number;
  /** 购买的价格 */
  productPrice?: number;
  /** 展示用商品名 */
  productName?: string;
  /** 展示用单价 */
  price?: number;
  /** 到手价 */
  realAmount?: number;
  /** 优惠金额 */
  discountAmount?: number;
  /** 商品预览图 */
  previewAddress?: string;
  /** 订单详情场景下的购买数量字段 */
  productQuantity?: number;
};

export type OrderBaseInfo = ReceiptInfo & {
  products?: ProductInfo[];
  /** 下单表单中的邮件字段（与 receiverEmail 同源） */
  email?: string;
};
