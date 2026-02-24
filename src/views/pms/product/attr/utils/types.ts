export interface FormItemProps {
  id?: number;
  title?: string;
  relatedId?: number | string;
  attrType?: number;
  attrRequired?: number;
  productId?: number | string;
  attrName?: string;
  attrValue?: string;
  attrDesc?: string;
  productOptions?: Array<{ label: string; value: string }>;
}

export interface FormProps {
  formInline?: FormItemProps;
}
