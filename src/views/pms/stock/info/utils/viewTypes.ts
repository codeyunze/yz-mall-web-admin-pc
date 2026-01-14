interface FormItemProps {
  productId?: number;
  skuId?: number;
  productName?: string;
  skuName?: string;
  quantity: number;
  remark: string;
  createTime?: string;
  operatorName?: string;
  readOnly?: boolean;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
