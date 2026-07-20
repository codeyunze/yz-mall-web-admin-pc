interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  taskTitle: string;
  taskCode: string;
  taskStatus: number;
  taskNode: string;
  /** 关联业务主键 */
  businessId?: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
