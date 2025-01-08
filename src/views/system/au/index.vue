<script setup lang="ts">
import { ref } from "vue";
import { useColumns, dayjs } from "@/views/system/au/utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";
import View from "@iconify-icons/ep/view";
import Edit from "@iconify-icons/ep/edit";

defineOptions({
  name: "SystemGold"
});

const formRef = ref();
const tableRef = ref();

const {
  loading,
  columns,
  form,
  dataList,
  pagination,
  selectedNum,
  adaptiveConfig,
  buttonClass,
  onSearch,
  resetForm,
  onCurrentChange,
  openDialog,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,
  handleDelete,
  handleUpdate
} = useColumns(tableRef);

const state = ref({
  status: "0",
  time: new Date().toString()
});

const filterColumns: PlusColumn[] = [
  {
    label: "交易类型",
    prop: "transactionType",
    valueType: "plus-radio",
    options: [
      {
        label: "买入",
        value: "0",
        color: "blue"
      },
      {
        label: "卖出",
        value: "1",
        color: "red"
      }
    ]
  },
  {
    label: "交易时间",
    prop: "transactionTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "请选择",
      endPlaceholder: "请选择"
    }
  },
  {
    label: "ID",
    prop: "id"
  }
  /*,
  {
    label: "盈利",
    prop: "profit",
    valueType: "plus-radio",
    options: [
      {
        label: "盈利",
        value: "0"
      },
      {
        label: "亏损",
        value: "1"
      }
    ]
  }*/
];

const handleChange = (values: any) => {
  console.log(values, "change");
};
const handleSearch = (values: any) => {
  form.transactionType = values.transactionType;
  form.id = values.id;
  if (values.transactionTime) {
    form.startTimeFilter = dayjs(values.transactionTime[0]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    form.endTimeFilter = dayjs(values.transactionTime[1]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  }
  onSearch();
};
const handleRest = () => {
  form.transactionType = null;
  form.relationId = null;
  form.startTimeFilter = null;
  form.endTimeFilter = null;
  form.id = null;
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
      title="黄金交易"
      :columns="columns"
      style="border-radius: 10px"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增交易记录
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
          @selection-change="handleSelectionChange"
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
              @click="openDialog('查看', row)"
            >
              详情
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Edit)"
              @click="openDialog('编辑', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`是否确认删除交易数量 [${row.quantity}] 克，价格为 [${row.price}] 的这条交易数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
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
