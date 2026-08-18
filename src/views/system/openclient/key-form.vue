<script setup lang="ts">
import { ref } from "vue";
import { keyUploadRules } from "./utils/rule";
import type { KeyUploadFormProps } from "./utils/types";

const props = withDefaults(defineProps<{ formInline: KeyUploadFormProps }>(), {
  formInline: () => ({
    clientId: "",
    clientPublicKey: "",
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
    :rules="keyUploadRules"
    label-width="110px"
  >
    <el-form-item label="客户端ID" prop="clientId">
      <el-input v-model="newFormInline.clientId" disabled />
    </el-form-item>

    <el-form-item label="客户端公钥" prop="clientPublicKey">
      <el-input
        v-model="newFormInline.clientPublicKey"
        type="textarea"
        :rows="6"
        placeholder="请输入客户端SM2公钥（Base64/PEM）"
      />
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
        :rows="2"
      />
    </el-form-item>
  </el-form>
</template>
