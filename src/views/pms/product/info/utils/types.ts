interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  name: string;
  titles: string;
  remark: string;
  price: number;
  publish_status: number;
  verify_status: number;
  album_pics: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
