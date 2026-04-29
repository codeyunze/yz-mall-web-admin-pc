import { reactive } from "vue";
import type { FormRules } from "element-plus";

export const formRules = reactive<FormRules>({
  tenantCode: [
    { required: true, message: "租户编码为必填项", trigger: "blur" }
  ],
  tenantName: [
    { required: true, message: "租户名称为必填项", trigger: "blur" }
  ],
  tenantStatus: [
    { required: true, message: "租户状态为必填项", trigger: "change" }
  ]
});
