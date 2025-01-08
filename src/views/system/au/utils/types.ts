interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  transactionType: number;
  price: number;
  quantity: number;
  relationId: any;
  transactionTime: string;
  profitAmount: number;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
