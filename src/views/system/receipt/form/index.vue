<script setup lang="ts">
import { Aim } from "@element-plus/icons-vue";
import { onMounted, ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import type { CascaderProps } from "element-plus";
import { getArea } from "@/api/system";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    higherDeptOptions: [],
    id: 0,
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverProvince: "",
    receiverCity: "",
    receiverDistrict: "",
    receiverAddress: ""
  })
});

const selectAddress = ref([]);

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

let id = 0;
const addressProps: CascaderProps = {
  lazy: true,
  lazyLoad(node, resolve) {
    const { level, value } = node;
    getArea(level === 0 ? "-1" : value + "").then(res => {
      if (level == 2) {
        res.data.forEach(item => {
          item.leaf = true;
        });
      }
      resolve(res.data);
    });
  }
};

const handleAddressChange = (values: any) => {
  newFormInline.value.receiverProvince = values[0];
  newFormInline.value.receiverCity = values[1];
  newFormInline.value.receiverDistrict = values[2];
};

defineExpose({ getRef });

onMounted(() => {
  selectAddress.value[0] = newFormInline.value.receiverProvince;
  selectAddress.value[1] = newFormInline.value.receiverCity;
  selectAddress.value[2] = newFormInline.value.receiverDistrict;
});
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="收货人" prop="receiverName">
          <el-input
            v-model="newFormInline.receiverName"
            clearable
            placeholder="请输入收货人名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="手机号" prop="receiverPhone">
          <el-input
            v-model="newFormInline.receiverPhone"
            clearable
            placeholder="请输入收货手机号"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="通知邮件" prop="receiverEmail">
          <el-input
            v-model="newFormInline.receiverEmail"
            clearable
            placeholder="请输入通知消息接收邮件"
          />
        </el-form-item>
      </re-col>
      <re-col :value="24" :xs="24" :sm="24">
        <el-form-item label="收货地址" prop="receiverProvince">
          <el-cascader
            v-model="selectAddress"
            :props="addressProps"
            class="w-full"
            clearable
            placeholder="请选择收货地址"
            @change="handleAddressChange"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="详细地址" prop="receiverAddress">
          <el-input
            v-model="newFormInline.receiverAddress"
            placeholder="请输入备注信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
