interface FormItemProps {
  productId?: number;
  productName?: string;
  quantity: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
