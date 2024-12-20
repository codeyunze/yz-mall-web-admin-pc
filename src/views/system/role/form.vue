<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    higherDeptOptions: [],
    id: "",
    roleName: "",
    roleCode: "",
    remark: "",
    orgId: -1
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
    <el-form-item label="所属部门">
      <el-cascader
        v-model="newFormInline.orgId"
        class="w-full"
        :options="newFormInline.higherDeptOptions"
        :props="{
          value: 'id',
          label: 'orgName',
          emitPath: false,
          checkStrictly: true
        }"
        clearable
        filterable
        placeholder="请选择角色所属部门"
      >
        <template #default="{ node, data }">
          <span>{{ data.orgName }}</span>
          <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
        </template>
      </el-cascader>
    </el-form-item>
    <el-form-item label="角色名称" prop="roleName">
      <el-input
        v-model="newFormInline.roleName"
        clearable
        placeholder="请输入角色名称"
      />
    </el-form-item>

    <el-form-item label="角色标识" prop="roleCode">
      <el-input
        v-model="newFormInline.roleCode"
        clearable
        placeholder="请输入角色标识"
      />
    </el-form-item>

    <el-form-item label="备注">
      <el-input
        v-model="newFormInline.remark"
        placeholder="请输入备注信息"
        type="textarea"
      />
    </el-form-item>
  </el-form>
</template>
