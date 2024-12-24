<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    name: "",
    price: 0,
    remark: "",
    titles: "",
    publish_status: 0,
    verify_status: 1,
    album_pics: ""
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
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="商品名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入商品名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="售价" prop="price">
          <el-input
            v-model="newFormInline.price"
            clearable
            placeholder="请输入商品售价"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="标签" prop="titles">
          <el-input
            v-model="newFormInline.titles"
            clearable
            placeholder="请输入商品标签"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="商品备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入商品说明信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
