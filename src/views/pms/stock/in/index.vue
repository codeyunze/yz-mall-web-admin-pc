<script setup lang="ts">
import { ref } from "vue";
import { useColumns, dayjs } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import View from "@iconify-icons/ep/view";

defineOptions({
  name: "PmsStockInPage"
});

const tableRef = ref();

const {
  loading,
  columns,
  form,
  dataList,
  pagination,
  onSearch,
  openDialog,
  handleSizeChange,
  handleCurrentChange
} = useColumns();

const state = ref({
  status: "0",
  time: new Date().toString()
});

const filterColumns: PlusColumn[] = [
  {
    label: "商品名称",
    prop: "productName"
  },
  {
    label: "商品标签",
    prop: "titles"
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
  form.productName = values.productName;
  form.productId = values.productId;
  if (values.createTime) {
    form.startTimeFilter = dayjs(values.createTime[0]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    form.endTimeFilter = dayjs(values.createTime[1]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  }
  onSearch();
};
const handleRest = () => {
  form.productName = null;
  form.productId = 0;
  form.startTimeFilter = null;
  form.endTimeFilter = null;
  onSearch();
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
      title="入库明细"
      :columns="columns"
      style="border-radius: 10px"
      @refresh="onSearch"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          row-key="id"
          adaptive
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
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="openDialog('入库', row)"
            >
              详情
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
