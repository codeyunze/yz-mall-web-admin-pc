<script setup lang="ts">
/**
 * 售后/退款审核列表：筛选退款单并执行通过或拒绝。
 */
import { ref } from "vue";
import { useColumns } from "@/views/mall/order/refund/utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { PureTableBar } from "@/components/RePureTableBar";

defineOptions({
  name: "OmsOrderRefundPage"
});

const tableRef = ref();

const {
  loading,
  columns,
  form,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleApprove,
  handleReject,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange
} = useColumns(tableRef);

const state = ref({
  status: "0",
  time: new Date().toString()
});

const filterColumns: PlusColumn[] = [
  {
    label: "退款单号",
    prop: "refundNo"
  },
  {
    label: "订单编号",
    prop: "orderCode"
  },
  {
    label: "退款状态",
    prop: "refundStatus",
    valueType: "select",
    options: [
      {
        label: "待审核",
        value: "0"
      },
      {
        label: "已通过",
        value: "1"
      },
      {
        label: "已拒绝",
        value: "2"
      },
      {
        label: "已取消",
        value: "3"
      }
    ]
  }
];

const handleChange = (values: any) => {
  console.log(values, "change");
};

const handleSearch = (values: any) => {
  form.refundNo = values.refundNo;
  form.orderCode = values.orderCode;
  form.refundStatus =
    values.refundStatus === "" || values.refundStatus == null
      ? null
      : Number(values.refundStatus);
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
      @reset="resetForm"
    />

    <PureTableBar
      title="退款审核"
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
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <template v-if="row.refundStatus === 0">
              <el-button
                class="reset-margin"
                link
                type="success"
                :size="size"
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                class="reset-margin"
                link
                type="danger"
                :size="size"
                @click="handleReject(row)"
              >
                拒绝
              </el-button>
            </template>
            <span v-else>-</span>
          </template>
        </pure-table>
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
