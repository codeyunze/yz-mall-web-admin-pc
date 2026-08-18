interface FormItemProps {
  /** 主键Id */
  id?: number;
  /** 应用名称 */
  clientName: string;
  /** 联系人 */
  contactName?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 授权到期时间 */
  expireTime?: string;
  /** IP白名单 */
  ipWhitelist?: string;
  /** QPS上限 */
  rateLimitQps?: number;
  /** 备注 */
  remark?: string;
}
interface FormProps {
  formInline: FormItemProps;
}

/** 密钥上传表单 */
interface KeyUploadFormProps {
  clientId: string;
  clientPublicKey: string;
  remark?: string;
}

/** 授权操作表单 */
interface AuthFormProps {
  clientId: string;
  permissionCodes: string[];
  remark?: string;
}

export type { FormItemProps, FormProps, KeyUploadFormProps, AuthFormProps };
