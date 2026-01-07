<script setup lang="ts">
import { ref } from "vue";
import { useMsgRetry, dayjs } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ElMessageBox } from "element-plus";
import View from "@iconify-icons/ep/view";
import Refresh from "@iconify-icons/ep/refresh";

defineOptions({
  name: "SystemMsgRetry"
});

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
  handleSizeChange,
  handleCurrentChange,
  handleViewDetail
} = useMsgRetry();

const tableRef = ref();

const filterColumns: PlusColumn[] = [
  {
    label: "消息ID",
    prop: "msgId"
  },
  {
    label: "业务ID",
    prop: "businessId"
  },
  {
    label: "Topic",
    prop: "topic"
  },
  {
    label: "标签",
    prop: "tags"
  },
  {
    label: "消费者组",
    prop: "consumerGroup"
  },
  {
    label: "状态",
    prop: "status",
    valueType: "select",
    options: [
      {
        label: "重试中",
        value: 0
      },
      {
        label: "待处理",
        value: 1
      },
      {
        label: "已处理",
        value: 2
      },
      {
        label: "已忽略",
        value: 3
      }
    ]
  },
  {
    label: "创建时间",
    prop: "createTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "开始时间",
      endPlaceholder: "结束时间"
    }
  }
];

const handleSearch = (values: Record<string, unknown>) => {
  form.msgId = (values.msgId as string) || null;
  form.businessId = (values.businessId as string) || null;
  form.topic = (values.topic as string) || null;
  form.tags = (values.tags as string) || null;
  form.consumerGroup = (values.consumerGroup as string) || null;
  form.status =
    values.status !== undefined && values.status !== ""
      ? Number(values.status)
      : null;
  if (values.createTime) {
    form.createTimeStart = dayjs((values.createTime as Date[])[0]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    form.createTimeEnd = dayjs((values.createTime as Date[])[1]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  } else {
    form.createTimeStart = null;
    form.createTimeEnd = null;
  }
  pagination.currentPage = 1;
  onSearch();
};

const handleRest = () => {
  resetForm();
};
</script>

<template>
  <div class="main">
    <PlusSearch
      :columns="filterColumns"
      :loading="loading"
      @search="handleSearch"
      @reset="handleRest"
    />
    <PureTableBar
      title="消息重试管理"
      :columns="columns"
      style="border-radius: 10px"
      @refresh="onSearch"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :loading-config="loadingConfig"
          :size="size"
          :adaptive-config="adaptiveConfig"
          :adaptive="true"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
:deep(.msg-retry-detail-dialog) {
  .el-message-box__content {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style>
