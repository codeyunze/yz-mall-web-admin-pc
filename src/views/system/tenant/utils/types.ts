interface FormItemProps {
  id?: string | number;
  tenantCode: string;
  tenantName: string;
  contactName?: string;
  contactPhone?: string;
  expireTime?: string;
  tenantStatus: number;
  remark?: string;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
