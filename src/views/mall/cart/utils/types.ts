interface OrderProduct {
  id: string;
  orderId: string;
  productId: string;
  productQuantity: number;
  quantity: number;
  discountAmount: number;
  realAmount: number;
  productAttributes: string;
  productName: string;
  price: number;
  remark: string;
  previewAddress: string;
}

interface Order {
  id: string;
  orderCode: string;
  orderStatus: number;
  orderType: number;
  deliveryTime: string;
  confirmStatus: number;
  receiveTime: string;
  payType: number;
  totalAmount: number;
  discountAmount: number;
  payAmount: number;
  note: string;
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverAddress: string;
  receiverProvinceName: string;
  receiverCityName: string;
  receiverDistrictName: string;
  email: string;
  products?: OrderProduct[];
}

export type { Order, OrderProduct };
