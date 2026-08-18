import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  clientName: [
    { required: true, message: "应用名称为必填项", trigger: "blur" }
  ],
  contactPhone: [
    {
      pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/,
      message: "请输入正确的联系电话",
      trigger: "blur"
    }
  ]
});

/** 公钥上传表单校验 */
export const keyUploadRules = reactive(<FormRules>{
  clientId: [{ required: true, message: "clientId不能为空", trigger: "blur" }],
  clientPublicKey: [
    { required: true, message: "客户端公钥不能为空", trigger: "blur" }
  ]
});
