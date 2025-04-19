import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone, isEmail } from "@pureadmin/utils";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  receiverName: [
    { required: true, message: "用户名称为必填项", trigger: "blur" }
  ],
  receiverPhone: [
    { required: true, message: "收货手机号为必填项", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isPhone(value)) {
          callback(new Error("请输入正确的手机号码格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
      // trigger: "click" // 如果想在点击确定按钮时触发这个校验，trigger 设置成 click 即可
    }
  ],
  receiverEmail: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isEmail(value)) {
          callback(new Error("请输入正确的邮箱格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  receiverProvince: [
    { required: true, message: "收货地址(省)为必填项", trigger: "blur" }
  ],
  receiverCity: [
    { required: true, message: "收货地址(市)为必填项", trigger: "blur" }
  ],
  receiverDistrict: [
    { required: true, message: "收货地址(区/县)为必填项", trigger: "blur" }
  ],
  receiverAddress: [
    { required: true, message: "收货详细地址为必填项", trigger: "blur" }
  ]
});
