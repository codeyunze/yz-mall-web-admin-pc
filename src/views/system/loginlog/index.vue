<script setup lang="ts">
import { ref } from "vue";
import { useLoginLog, dayjs } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Delete from "@iconify-icons/ep/delete";

defineOptions({
  name: "SystemLoginLog"
});

const {
  loading,
  columns,
  form,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange,
  handleClearLog
} = useLoginLog();

const state = ref({
  username: "",
  status: "",
  loginTime: null
});

const filterColumns: PlusColumn[] = [
  {
    label: "用户名",
    prop: "username"
  },
  {
    label: "登录状态",
    prop: "status",
    valueType: "select",
    options: [
      {
        label: "成功",
        value: "1"
      },
      {
        label: "失败",
        value: "0"
      }
    ]
  },
  {
    label: "登录时间",
    prop: "loginTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "请选择",
      endPlaceholder: "请选择"
    }
  }
];

const handleChange = (values: Record<string, unknown>) => {
  console.log(values, "change");
};

const handleSearch = (values: Record<string, unknown>) => {
  form.username = (values.username as string) || null;
  form.status =
    values.status !== undefined && values.status !== ""
      ? Number(values.status)
      : null;
  if (values.loginTime) {
    form.startTime = dayjs((values.loginTime as Date[])[0]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    form.endTime = dayjs((values.loginTime as Date[])[1]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  } else {
    form.startTime = null;
    form.endTime = null;
  }
  pagination.currentPage = 1;
  onSearch();
};

const handleRest = () => {
  state.value = {
    username: "",
    status: "",
    loginTime: null
  };
  resetForm();
};
</script>

<template>
  <div class="main">
    <PlusSearch
      v-model="state"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
      style="margin-bottom: 20px; border-radius: 10px"
      :columns="filterColumns"
      :show-number="2"
      label-width="80"
      label-position="right"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleRest"
    />

    <PureTableBar
      title="登录日志管理"
      :columns="columns"
      style="border-radius: 10px"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="danger"
          :icon="useRenderIcon(Delete as any)"
          @click="handleClearLog"
        >
          清空日志
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          row-key="id"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        />
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
