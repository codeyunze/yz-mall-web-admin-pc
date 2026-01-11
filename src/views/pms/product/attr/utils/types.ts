export interface FormItemProps {
  id?: number;
  title?: string;
  relatedId?: number;
  attrName?: string;
  attrValue?: string;
  attrDesc?: string;
}

export interface FormProps {
  formInline?: FormItemProps;
}
