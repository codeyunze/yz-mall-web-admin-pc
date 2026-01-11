import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive<FormRules>({
  relatedId: [
    { required: true, message: "关联ID为必填项", trigger: "blur" },
    { type: "number", min: 1, message: "关联ID必须大于0", trigger: "blur" }
  ],
  attrName: [
    { required: true, message: "属性名称为必填项", trigger: "blur" },
    { max: 255, message: "属性名称长度不能超过255", trigger: "blur" }
  ],
  attrValue: [
    { required: true, message: "属性值为必填项", trigger: "blur" },
    { max: 255, message: "属性值长度不能超过255", trigger: "blur" }
  ]
});
