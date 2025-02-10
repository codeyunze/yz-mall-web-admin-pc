<script setup lang="ts">
import { ref } from "vue";
import { useColumns, dayjs } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import View from "@iconify-icons/ep/view";

defineOptions({
  name: "OmsOrderPage"
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
  handleCurrentChange
} = useColumns(tableRef);

const state = ref({
  status: "0",
  time: new Date().toString()
});

const filterColumns: PlusColumn[] = [
  {
    label: "订单编号",
    prop: "orderCode"
  },
  {
    // 0待付款；1待发货；2已发货；3待收货；4已完成；5已关闭；6无效订单
    label: "订单状态",
    prop: "orderStatus",
    valueType: "select",
    options: [
      {
        label: "待付款",
        value: "0"
      },
      {
        label: "待发货",
        value: "1"
      },
      {
        label: "已发货",
        value: "2"
      },
      {
        label: "待收货",
        value: "3"
      },
      {
        label: "已完成",
        value: "4"
      },
      {
        label: "已关闭",
        value: "5"
      },
      {
        label: "无效订单",
        value: "6"
      }
    ]
  },
  {
    label: "订单类型",
    prop: "orderType",
    valueType: "select",
    options: [
      {
        label: "正常订单",
        value: "0"
      },
      {
        label: "秒杀订单",
        value: "1"
      }
    ]
  },
  {
    // 0未确认收货；1已确认收货
    label: "收货状态",
    prop: "confirmStatus",
    valueType: "select",
    options: [
      {
        label: "未收货",
        value: "0"
      },
      {
        label: "已收货",
        value: "1"
      }
    ]
  },
  {
    // 0未支付/待支付；1支付宝；2微信
    label: "支付方式",
    prop: "payType",
    valueType: "select",
    options: [
      {
        label: "待支付",
        value: "0"
      },
      {
        label: "支付宝支付",
        value: "1"
      },
      {
        label: "微信支付",
        value: "1"
      }
    ]
  },
  {
    label: "收货手机",
    prop: "receiverPhone"
  }
];

const handleChange = (values: any) => {
  console.log(values, "change");
};
const handleSearch = (values: any) => {
  form.orderCode = values.orderCode;
  form.orderStatus = values.orderStatus;
  form.orderType = values.orderType;
  form.confirmStatus = values.confirmStatus;
  form.payType = values.payType;
  form.receiverPhone = values.receiverPhone;
  onSearch();
};
const handleRest = () => {
  form.orderCode = null;
  form.orderStatus = null;
  form.orderType = null;
  form.confirmStatus = null;
  form.payType = null;
  form.receiverPhone = null;
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
      title="全部订单"
      :columns="columns"
      style="border-radius: 10px"
      @refresh="onSearch"
    >
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
              @click="openDialog('订单详情', row)"
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
