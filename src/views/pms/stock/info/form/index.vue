<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/stock/info/utils/rule";
import { FormProps } from "@/views/pms/stock/info/utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    productId: 0,
    quantity: 0,
    remark: ""
  })
});

const formRef = ref();
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
        <el-form-item label="商品" prop="name">
          <el-input
            v-model="newFormInline.name"
            placeholder="请选择商品"
            readonly
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="newFormInline.quantity" :min="1" />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="商品备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入说明信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
