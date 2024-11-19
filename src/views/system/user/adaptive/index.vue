<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import { getPickerShortcuts } from "../../utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";

import Refresh from "@iconify-icons/ep/refresh";

const formRef = ref();
const tableRef = ref();

const {
  loading,
  columns,
  form,
  dataList,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onSearch,
  resetForm,
  onSizeChange,
  onCurrentChange
} = useColumns();

const state = ref({
  status: "0",
  time: new Date().toString()
});

const filterColumns: PlusColumn[] = [
  {
    label: "手机号",
    prop: "phone"
  },
  {
    label: "邮件",
    prop: "email"
  },
  {
    label: "创建时间",
    prop: "createTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "请选择",
      endPlaceholder: "请选择"
    }
  }
];

const handleChange = (values: any) => {
  console.log(values, "change");
};
const handleSearch = (values: any) => {
  console.log(values, "search");
};
const handleRest = () => {
  console.log("handleRest");
};
</script>

<template>
  <div class="main">
    <PlusSearch
      v-model="state"
      :columns="filterColumns"
      :show-number="2"
      label-width="80"
      label-position="right"
      @change="handleChange"
      @search="handleSearch"
      @reset="handleRest"
    />

    <pure-table
      ref="tableRef"
      border
      adaptive
      stripe
      :adaptiveConfig="adaptiveConfig"
      row-key="id"
      alignWhole="center"
      showOverflowTooltip
      :loading="loading"
      :loading-config="loadingConfig"
      :data="
        dataList.slice(
          (pagination.currentPage - 1) * pagination.pageSize,
          pagination.currentPage * pagination.pageSize
        )
      "
      :columns="columns"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)'
      }"
      :pagination="pagination"
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
    />
  </div>
</template>
