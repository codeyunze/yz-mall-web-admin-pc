interface FormItemProps {
  productId?: number;
  name?: string;
  quantity: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
