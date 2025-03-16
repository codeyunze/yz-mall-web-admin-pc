import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  productName: [
    { required: true, message: "商品名称为必填项", trigger: "blur" }
  ],
  productPrice: [
    { required: true, message: "商品售价为必填项", trigger: "blur" }
  ],
  titles: [{ required: true, message: "商品标签为必填项", trigger: "blur" }],
  albumPics: [{ required: true, message: "商品图片为必传项", trigger: "blur" }]
});
