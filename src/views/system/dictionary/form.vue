<script setup lang="ts">
import { ref } from "vue";
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
    invalid: "0",
    higherDictionaryOptions: []
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="100px"
  >
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="上级字典">
          <el-cascader
            v-model="newFormInline.parentId"
            class="w-full"
            :options="newFormInline.higherDictionaryOptions"
            :props="{
              value: 'id',
              label: 'label',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择上级字典（不选则为顶级）"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="字典键" prop="dictionaryKey">
          <el-input
            v-model="newFormInline.dictionaryKey"
            clearable
            placeholder="请输入字典键"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="字典值" prop="dictionaryValue">
          <el-input
            v-model="newFormInline.dictionaryValue"
            clearable
            placeholder="请输入字典值"
          />
        </el-form-item>
      </re-col>

      <re-col>
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

      <re-col>
        <el-form-item label="状态">
          <el-radio-group v-model="newFormInline.invalid">
            <el-radio label="0">有效</el-radio>
            <el-radio label="1">无效</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
