<script setup lang="ts">
import { ref, watch, computed } from "vue";
import ReCol from "@/components/ReCol";
import type { FormRules } from "element-plus";

interface DatasourceFormItem {
  id?: string | number;
  tenantId: string | number;
  serviceCode: string;
  dbType: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUsername: string;
  dbPasswordEnc?: string;
  dbParams?: string;
  dsStatus: number;
  remark?: string;
}

const props = withDefaults(
  defineProps<{ formInline: DatasourceFormItem; isEdit?: boolean }>(),
  {
    formInline: () => ({
      tenantId: "",
      serviceCode: "",
      dbType: "mysql",
      dbHost: "",
      dbPort: 3306,
      dbName: "",
      dbUsername: "",
      dbPasswordEnc: "",
      dbParams: "",
      dsStatus: 1,
      remark: ""
    }),
    isEdit: false
  }
);

const ruleFormRef = ref();
const newFormInline = ref({ ...props.formInline });

const formRules = computed<FormRules>(() => ({
  serviceCode: [
    { required: true, message: "服务标识为必填项", trigger: "blur" }
  ],
  dbType: [{ required: true, message: "数据库类型为必填项", trigger: "blur" }],
  dbHost: [{ required: true, message: "数据库主机为必填项", trigger: "blur" }],
  dbPort: [
    { required: true, message: "数据库端口为必填项", trigger: "change" }
  ],
  dbName: [{ required: true, message: "数据库名称为必填项", trigger: "blur" }],
  dbUsername: [
    { required: true, message: "数据库用户名为必填项", trigger: "blur" }
  ],
  dbPasswordEnc: props.isEdit
    ? []
    : [{ required: true, message: "数据库密码为必填项", trigger: "blur" }]
}));

watch(
  () => props.formInline,
  val => {
    newFormInline.value = { ...val };
  },
  { immediate: true, deep: true }
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
    label-width="110px"
  >
    <el-row :gutter="20">
      <re-col :value="12">
        <el-form-item label="服务标识" prop="serviceCode">
          <el-input
            v-model="newFormInline.serviceCode"
            clearable
            placeholder="如 mall-sys/mall-pms/mall-oms"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="数据库类型" prop="dbType">
          <el-input
            v-model="newFormInline.dbType"
            clearable
            placeholder="如 mysql"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="数据库主机" prop="dbHost">
          <el-input
            v-model="newFormInline.dbHost"
            clearable
            placeholder="请输入数据库主机"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="数据库端口" prop="dbPort">
          <el-input-number
            v-model="newFormInline.dbPort"
            class="!w-full"
            :min="1"
            :max="65535"
            controls-position="right"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="数据库名" prop="dbName">
          <el-input
            v-model="newFormInline.dbName"
            clearable
            placeholder="请输入数据库名"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="数据库用户" prop="dbUsername">
          <el-input
            v-model="newFormInline.dbUsername"
            clearable
            placeholder="请输入数据库用户"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="数据库密码" prop="dbPasswordEnc">
          <el-input
            v-model="newFormInline.dbPasswordEnc"
            clearable
            show-password
            :placeholder="isEdit ? '留空表示不修改密码' : '请输入数据库密码'"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12">
        <el-form-item label="连接状态">
          <el-radio-group v-model="newFormInline.dsStatus">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="24">
        <el-form-item label="连接参数">
          <el-input
            v-model="newFormInline.dbParams"
            clearable
            placeholder="如 useSSL=false&serverTimezone=Asia/Shanghai"
          />
        </el-form-item>
      </re-col>
      <re-col :value="24">
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
