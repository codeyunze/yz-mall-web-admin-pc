import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  skuId: [{ required: true, message: "SKU为必选项", trigger: "change" }],
  quantity: [
    { required: true, message: "商品入库数量为必填项", trigger: "blur" }
  ]
});
