import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  price: [{ required: true, message: "交易价格为必填项", trigger: "blur" }],
  quantity: [{ required: true, message: "交易数量为必填项", trigger: "blur" }]
});
