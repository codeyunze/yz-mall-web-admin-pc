import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive<FormRules>({
  categoryName: [
    { required: true, message: "分类名称不能为空", trigger: "blur" }
  ]
});
