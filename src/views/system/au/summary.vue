<script setup lang="ts">
import { tableDataExpand } from "../../table/base/data";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import { useColumns } from "@/views/system/au/utils/summaryHook";
import { ref } from "vue";

const tableRef = ref();
const { openDialog, onSearch, dataList } = useColumns(tableRef);

const columns: TableColumnList = [
  {
    type: "expand",
    slot: "expand"
  },
  {
    label: "序号",
    type: "index",
    width: 90
  },
  {
    label: "ID",
    prop: "id",
    width: 100
  },
  {
    label: "交易数量（克）",
    prop: "quantity"
  },
  {
    label: "交易价格（元/克）",
    prop: "price"
  },
  {
    label: "交易总价（元）",
    prop: "priceTotal"
  },
  {
    label: "盈利金额（元）",
    prop: "profitAmount"
  },
  {
    label: "交易时间",
    prop: "transactionTime",
    width: 200
  }
];

const childColumns: TableColumnList = [
  {
    label: "ID",
    prop: "id"
  },
  {
    label: "卖出价格（元）",
    prop: "price"
  },
  {
    label: "卖出数量（克）",
    prop: "quantity"
  },
  {
    label: "盈利金额（元）",
    prop: "profitAmount"
  },
  {
    label: "交易时间",
    prop: "transactionTime"
  }
];
</script>

<template>
  <div>
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

      <pure-table
        ref="tableRef"
        adaptive
        :adaptiveConfig="{ offsetBottom: 108 }"
        align-whole="center"
        table-layout="auto"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-primary)'
        }"
        :data="dataList"
        :columns="columns"
      >
        <template #expand="{ row }">
          <div class="m-4">
            <pure-table
              :data="row.sellOutRecords"
              :columns="childColumns"
              border
              align-whole="center"
              table-layout="auto"
            />
          </div>
        </template>
      </pure-table>
    </PureTableBar>
  </div>
</template>
