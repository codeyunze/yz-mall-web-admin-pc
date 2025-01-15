<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import { useColumns } from "@/views/system/au/utils/summaryHook";
import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { dayjs } from "@/views/system/au/utils/hook";
import { ref } from "vue";

const {
  openDialog,
  onSearch,
  form,
  dataList,
  columns,
  childColumns,
  pagination,
  handleSizeChange,
  handleCurrentChange
} = useColumns();

const state = ref({
  status: "0",
  time: new Date().toString()
});

const handleChange = (values: any) => {
  console.log(values, "change");
};

const handleSearch = (values: any) => {
  form.id = values.id;
  form.stockStatus = values.stockStatus;
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
  form.stockStatus = null;
  form.startTimeFilter = null;
  form.endTimeFilter = null;
  form.id = null;
  onSearch();
};

const filterColumns: PlusColumn[] = [
  {
    label: "库存",
    prop: "stockStatus",
    valueType: "select",
    options: [
      {
        label: "还有剩余",
        value: "0",
        color: "red"
      },
      {
        label: "已全部卖出",
        value: "1",
        color: "blue"
      }
    ]
  },
  {
    label: "价格",
    prop: "price"
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
];
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
      title="交易汇总"
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
        :pagination="{ ...pagination }"
        @page-size-change="handleSizeChange"
        @page-current-change="handleCurrentChange"
      >
        <template #expand="{ row }">
          <div class="m-4">
            <p class="mb-2">买入价格（元/克）: {{ row.price }}</p>
            <p class="mb-2">买入数量（克）: {{ row.quantity }}</p>
            <p class="mb-2">盈利金额（元）: {{ row.profitAmount }}</p>
            <p class="mb-4">交易时间: {{ row.transactionTime }}</p>
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
