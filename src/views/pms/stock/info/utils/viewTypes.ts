interface FormItemProps {
  productId?: number;
  skuId?: number;
  productName?: string;
  skuName?: string;
  quantity: number;
  remark: string;
  createTime?: string;
  createName?: string;
  readOnly?: boolean;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
