interface FormItemProps {
  higherDeptOptions: Record<string, unknown>[];
  id: number;
  parentId: number;
  orgName: string;
  userId: string;
  phone: string | number;
  email: string;
  sort: number;
  status: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
