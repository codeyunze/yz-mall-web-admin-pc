// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  higherDeptOptions: Record<string, unknown>[];
  /** 主键Id */
  id: string;
  /** 角色名称 */
  roleName: string;
  /** 角色编号 */
  roleCode: string;
  /** 备注 */
  remark: string;
  /** 所属组织 */
  orgId: number;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
