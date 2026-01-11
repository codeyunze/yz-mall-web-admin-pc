interface FormItemProps {
  productId?: number;
  skuId?: number;
  productName?: string;
  skuName?: string;
  quantity: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
