<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/product/category/utils/rule";
import { FormProps } from "@/views/pms/product/category/utils/types";

interface ExtendedFormItemProps {
  id?: number;
  title: string;
  parentId?: number;
  categoryName: string;
  categoryDesc?: string;
  sortOrder?: number;
  categoryTreeOptions?: any[];
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () =>
    ({
      title: "新增",
      id: 0,
      parentId: 0,
      categoryName: "",
      categoryDesc: "",
      sortOrder: 0,
      categoryTreeOptions: []
    }) as ExtendedFormItemProps
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline as ExtendedFormItemProps);

// 分类树形选项
const categoryTreeOptions = ref([]);

// 监听formInline变化，更新分类树选项
watch(
  () => props.formInline,
  newVal => {
    const extendedVal = newVal as ExtendedFormItemProps;
    newFormInline.value = { ...extendedVal };
    // 如果parentId为0，设置为null，这样el-tree-select会显示placeholder而不是"0"
    if (newFormInline.value.parentId === 0) {
      newFormInline.value.parentId = null;
    }
    if (extendedVal.categoryTreeOptions) {
      categoryTreeOptions.value = extendedVal.categoryTreeOptions;
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
  <div>
    <el-form
      ref="ruleFormRef"
      :model="newFormInline"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="30">
        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="父分类" prop="parentId">
            <el-tree-select
              v-model="newFormInline.parentId"
              :data="categoryTreeOptions"
              :props="{
                label: 'categoryName',
                value: 'id',
                children: 'children'
              }"
              placeholder="请选择父分类（不选择则为顶级分类）"
              clearable
              check-strictly
              :render-after-expand="false"
              style="width: 100%"
            />
            <div style=" margin-top: 5px; font-size: 12px;color: #909399">
              不选择父分类则创建顶级分类
            </div>
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="分类名称" prop="categoryName">
            <el-input
              v-model="newFormInline.categoryName"
              clearable
              placeholder="请输入分类名称"
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="排序权重" prop="sortOrder">
            <el-input-number
              v-model="newFormInline.sortOrder"
              :min="0"
              :max="9999"
              placeholder="数值越大排序越靠前"
              style="width: 100%"
            />
            <div style=" margin-top: 5px; font-size: 12px;color: #909399">
              数值越大排序越靠前，默认为0
            </div>
          </el-form-item>
        </re-col>

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="分类描述" prop="categoryDesc">
            <el-input
              v-model="newFormInline.categoryDesc"
              placeholder="请输入分类描述"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
  </div>
</template>
