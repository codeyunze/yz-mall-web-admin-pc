interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  parentId?: number;
  categoryName: string;
  categoryDesc?: string;
  sortOrder?: number;
  categoryTreeOptions?: any[];
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
