interface FormItemProps {
  skuId?: number;
  productName?: string;
  quantity: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
