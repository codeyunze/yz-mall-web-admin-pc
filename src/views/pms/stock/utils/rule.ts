import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  productId: [{ required: true, message: "商品为必选项", trigger: "blur" }],
  quantity: [
    { required: true, message: "商品入库数量为必填项", trigger: "blur" }
  ]
});
