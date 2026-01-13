export interface FormItemProps {
  id?: number;
  title?: string;
  relatedId?: number;
  attrType?: number;
  attrRequired?: number;
  productId?: number;
  attrName?: string;
  attrValue?: string;
  attrDesc?: string;
  productOptions?: Array<{ label: string; value: number }>;
}

export interface FormProps {
  formInline?: FormItemProps;
}
