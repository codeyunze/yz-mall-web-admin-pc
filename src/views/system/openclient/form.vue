<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: undefined,
    clientName: "",
    contactName: "",
    contactPhone: "",
    expireTime: "",
    ipWhitelist: "",
    rateLimitQps: undefined,
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

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
    label-width="100px"
  >
    <el-form-item label="应用名称" prop="clientName">
      <el-input
        v-model="newFormInline.clientName"
        clearable
        placeholder="请输入应用名称"
      />
    </el-form-item>

    <el-form-item label="联系人" prop="contactName">
      <el-input
        v-model="newFormInline.contactName"
        clearable
        placeholder="请输入联系人"
      />
    </el-form-item>

    <el-form-item label="联系电话" prop="contactPhone">
      <el-input
        v-model="newFormInline.contactPhone"
        clearable
        placeholder="请输入联系电话"
      />
    </el-form-item>

    <el-form-item label="到期时间" prop="expireTime">
      <el-date-picker
        v-model="newFormInline.expireTime"
        type="datetime"
        placeholder="选择授权到期时间，空表示长期"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        class="!w-full"
      />
    </el-form-item>

    <el-form-item label="IP白名单" prop="ipWhitelist">
      <el-input
        v-model="newFormInline.ipWhitelist"
        clearable
        placeholder="多个IP用逗号分隔，空不限制"
      />
    </el-form-item>

    <el-form-item label="QPS上限" prop="rateLimitQps">
      <el-input-number
        v-model="newFormInline.rateLimitQps"
        :min="0"
        :max="10000"
        placeholder="留空不限制"
        class="!w-full"
      />
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
        :rows="3"
      />
    </el-form-item>
  </el-form>
</template>
