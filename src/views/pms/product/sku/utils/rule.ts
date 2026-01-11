import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive<FormRules>({
  productId: [{ required: true, message: "商品ID为必填项", trigger: "change" }],
  skuCode: [
    { required: true, message: "SKU编码为必填项", trigger: "blur" },
    { max: 36, message: "SKU编码长度不能超过36", trigger: "blur" }
  ],
  skuName: [
    { required: true, message: "SKU名称为必填项", trigger: "blur" },
    { max: 255, message: "SKU名称长度不能超过255", trigger: "blur" }
  ],
  priceFee: [
    { required: true, message: "售价为必填项", trigger: "blur" },
    { type: "number", min: 0, message: "售价必须大于等于0", trigger: "blur" }
  ],
  marketPriceFee: [
    { required: true, message: "市场价为必填项", trigger: "blur" },
    { type: "number", min: 0, message: "市场价必须大于等于0", trigger: "blur" }
  ]
});
