<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/product/attr/utils/rule";
import { FormProps } from "@/views/pms/product/attr/utils/types";

interface ExtendedFormItemProps {
  id?: number;
  title: string;
  relatedId?: number;
  attrName: string;
  attrValue: string;
  attrDesc?: string;
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () =>
    ({
      title: "新增",
      id: 0,
      relatedId: null,
      attrName: "",
      attrValue: "",
      attrDesc: ""
    }) as ExtendedFormItemProps
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline as ExtendedFormItemProps);

// 监听formInline变化
watch(
  () => props.formInline,
  newVal => {
    const extendedVal = newVal as ExtendedFormItemProps;
    newFormInline.value = { ...extendedVal };
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
  <div>
    <el-form
      ref="ruleFormRef"
      :model="newFormInline"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="30">
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="关联ID" prop="relatedId">
            <el-input-number
              v-model="newFormInline.relatedId"
              :min="0"
              placeholder="请输入关联ID（商品ID或SKU ID）"
              style="width: 100%"
            />
            <div style="margin-top: 5px; font-size: 12px; color: #909399">
              关联的商品ID或SKU ID
            </div>
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="属性名称" prop="attrName">
            <el-input
              v-model="newFormInline.attrName"
              clearable
              placeholder="请输入属性名称"
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="属性值" prop="attrValue">
            <el-input
              v-model="newFormInline.attrValue"
              clearable
              placeholder="请输入属性值"
            />
          </el-form-item>
        </re-col>

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="属性描述" prop="attrDesc">
            <el-input
              v-model="newFormInline.attrDesc"
              placeholder="请输入属性描述（可选）"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
  </div>
</template>
