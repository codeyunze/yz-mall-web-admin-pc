import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  dictionaryKey: [
    { required: true, message: "字典键为必填项", trigger: "blur" }
  ],
  dictionaryValue: [
    { required: true, message: "字典值为必填项", trigger: "blur" }
  ]
});
