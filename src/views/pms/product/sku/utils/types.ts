export interface FormItemProps {
  id?: number;
  title?: string;
  productId?: number;
  skuCode?: string;
  skuName?: string;
  priceFee?: number;
  marketPriceFee?: number;
  status?: number;
  albumPics?: string;
  productOptions?: any[];
}

export interface FormProps {
  formInline?: FormItemProps;
}
