interface FormItemProps {
  /** 用于判断是`新增`还是`修改` */
  title: string;
  id?: number;
  seriesCode?: string;
  seriesName?: string;
  brandName?: string;
  coverFileId?: number;
  sortNo?: number;
  status?: number;
  remark?: string;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
