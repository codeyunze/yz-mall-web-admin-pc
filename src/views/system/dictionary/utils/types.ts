interface FormItemProps {
  /** 字典主键Id */
  id: string | number;
  /** 祖先ID */
  ancestorId: string | number;
  /** 父级ID */
  parentId: string | number;
  /** 字典键 */
  dictionaryKey: string;
  /** 字典值 */
  dictionaryValue: string;
  /** 排序 */
  sortOrder: number;
  /** 是否无效 0-有效 1-无效 */
  invalid: string | number;
  /** 上级字典选项（用于级联选择） */
  higherDictionaryOptions?: Record<string, unknown>[];
  /** 子节点（树形结构） */
  children?: FormItemProps[] | null;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
