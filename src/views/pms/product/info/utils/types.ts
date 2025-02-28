interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  name: string;
  titles: string;
  remark: string;
  price: number;
  publishStatus: number;
  verifyStatus: number;
  albumPics: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
