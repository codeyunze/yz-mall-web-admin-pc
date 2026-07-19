interface FormItemProps {
  /** 用于判断是`新增`还是`修改` */
  title: string;
  higherDeptOptions: Record<string, unknown>[];
  id: number;
  receiverName: string;
  receiverPhone: string | number;
  receiverEmail: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverAddress: string;
  /** 是否默认地址：0否；1是 */
  isDefault: number;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
