<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/product/attr/utils/rule";
import { FormProps } from "@/views/pms/product/attr/utils/types";

interface ExtendedFormItemProps {
  id?: number;
  title: string;
  relatedId?: number;
  attrType?: number;
  attrRequired?: number;
  productId?: number;
  attrName: string;
  attrValue: string;
  attrDesc?: string;
  productOptions?: Array<{ label: string; value: number }>;
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () =>
    ({
      title: "新增",
      id: 0,
      relatedId: null,
      attrType: 0,
      attrRequired: 1,
      productId: null,
      attrName: "",
      attrValue: "",
      attrDesc: "",
      productOptions: []
    }) as ExtendedFormItemProps
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline as ExtendedFormItemProps);
const productOptions = ref<Array<{ label: string; value: number }>>([]);

// 监听formInline变化
watch(
  () => props.formInline,
  newVal => {
    const extendedVal = newVal as ExtendedFormItemProps;
    newFormInline.value = { ...extendedVal };
    // 设置商品选项
    if (extendedVal.productOptions) {
      productOptions.value = extendedVal.productOptions;
    }
    // 如果是编辑模式，将 relatedId 设置为 productId（因为 attrType 为 0 时，relatedId 就是 productId）
    if (
      extendedVal.title === "编辑" &&
      extendedVal.attrType === 0 &&
      extendedVal.relatedId
    ) {
      newFormInline.value.productId = extendedVal.relatedId;
    }
  },
  { deep: true, immediate: true }
);

// 监听商品选择变化，更新 relatedId
watch(
  () => newFormInline.value.productId,
  productId => {
    if (productId) {
      newFormInline.value.relatedId = productId;
    }
  }
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
        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="商品" prop="productId">
            <el-select
              v-model="newFormInline.productId"
              placeholder="请选择商品"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in productOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div style="margin-top: 5px; font-size: 12px; color: #909399">
              选择要添加属性的商品
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
