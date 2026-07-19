<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import type { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    tenantCode: "",
    tenantName: "",
    contactName: "",
    contactPhone: "",
    expireTime: "",
    tenantStatus: 1,
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref({ ...props.formInline });

watch(
  () => props.formInline,
  val => {
    newFormInline.value = { ...val };
  },
  { immediate: true, deep: true }
);

function getRef() {
  return ruleFormRef.value;
}

function getFormData() {
  return newFormInline.value;
}

defineExpose({ getRef, getFormData });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="110px"
  >
    <el-row :gutter="20">
      <re-col :value="12">
        <el-form-item label="租户编码" prop="tenantCode">
          <el-input
            v-model="newFormInline.tenantCode"
            clearable
            placeholder="请输入租户编码"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="租户名称" prop="tenantName">
          <el-input
            v-model="newFormInline.tenantName"
            clearable
            placeholder="请输入租户名称"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="联系人">
          <el-input
            v-model="newFormInline.contactName"
            clearable
            placeholder="请输入联系人"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="联系电话">
          <el-input
            v-model="newFormInline.contactPhone"
            clearable
            placeholder="请输入联系电话"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="newFormInline.expireTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择到期时间"
            class="!w-full"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="租户状态" prop="tenantStatus">
          <el-radio-group v-model="newFormInline.tenantStatus">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="24">
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
