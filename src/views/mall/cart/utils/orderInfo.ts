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
};

export type ProductInfo = {
  /** 商品Id */
  productId: string;
  /** 购买数量 */
  quantity: number;
  /** 购买的价格 */
  productPrice?: number;
};

export type OrderBaseInfo = ReceiptInfo & {
  products?: ProductInfo[];
};
