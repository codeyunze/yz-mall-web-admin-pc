<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import type { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: 0,
    ancestorId: "0",
    parentId: "0",
    dictionaryKey: "",
    dictionaryValue: "",
    sortOrder: 0,
    dictionaryEnable: "0",
    higherDictionaryOptions: []
  })
});

const ruleFormRef = ref();
const newFormInline = ref({ ...props.formInline });

// 监听 props.formInline 的变化，更新表单数据
watch(
  () => props.formInline,
  newVal => {
    if (newVal) {
      newFormInline.value = {
        ...newVal,
        // 确保 dictionaryEnable 是字符串类型
        dictionaryEnable:
          newVal.dictionaryEnable !== undefined &&
          newVal.dictionaryEnable !== null
            ? String(newVal.dictionaryEnable)
            : "0"
      };
    }
  },
  { deep: true, immediate: true }
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
    label-width="100px"
  >
    <el-row :gutter="30">
      <re-col :value="12">
        <el-form-item label="字典键" prop="dictionaryKey">
          <el-input
            v-model="newFormInline.dictionaryKey"
            clearable
            placeholder="请输入字典键"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="字典值" prop="dictionaryValue">
          <el-input
            v-model="newFormInline.dictionaryValue"
            clearable
            placeholder="请输入字典值"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="排序">
          <el-input-number
            v-model="newFormInline.sortOrder"
            class="!w-full"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12">
        <el-form-item label="状态">
          <el-radio-group v-model="newFormInline.dictionaryEnable">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
