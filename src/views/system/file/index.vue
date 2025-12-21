<script setup lang="ts">
import { ref } from "vue";
import { useFile, dayjs } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Delete from "@iconify-icons/ep/delete";
import Download from "@iconify-icons/ri/download-2-line";
import View from "@iconify-icons/ep/view";
import { PureTableBar } from "@/components/RePureTableBar";

defineOptions({
  name: "SystemFileManager"
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
  onSearch,
  resetForm,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,
  onSelectionCancel,
  onBatchDel,
  handlePreview,
  handleDownload,
  handleDelete
} = useFile(tableRef);

const state = ref({
  fileName: "",
  fileType: "",
  fileStorageStation: "",
  fileStorageMode: "",
  createTime: null
});

const filterColumns: PlusColumn[] = [
  {
    label: "文件名",
    prop: "fileName"
  },
  {
    label: "文件类型",
    prop: "fileType"
  },
  {
    label: "存储模式",
    prop: "fileStorageMode",
    valueType: "select",
    options: [
      {
        label: "本地存储",
        value: "local"
      },
      {
        label: "COS",
        value: "cos"
      },
      {
        label: "OSS",
        value: "oss"
      }
    ]
  },
  {
    label: "存储站",
    prop: "fileStorageStation"
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

const handleChange = (values: Record<string, unknown>) => {
  console.log(values, "change");
};

const handleSearch = (values: Record<string, unknown>) => {
  form.fileName = (values.fileName as string) || null;
  form.fileType = (values.fileType as string) || null;
  form.fileStorageStation = (values.fileStorageStation as string) || null;
  form.fileStorageMode = (values.fileStorageMode as string) || null;
  if (values.createTime) {
    form.createTimeFrom = dayjs((values.createTime as Date[])[0]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    form.createTimeTo = dayjs((values.createTime as Date[])[1]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  } else {
    form.createTimeFrom = null;
    form.createTimeTo = null;
  }
  pagination.currentPage = 1;
  onSearch();
};

const handleRest = () => {
  state.value = {
    fileName: "",
    fileType: "",
    fileStorageStation: "",
    fileStorageMode: "",
    createTime: null
  };
  resetForm();
};

function onFullscreen() {
  tableRef.value.setAdaptive();
}
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
      title="文件管理"
      :columns="columns"
      style="border-radius: 10px"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
      @fullscreen="onFullscreen"
    >
      <template v-slot="{ size, dynamicColumns }">
        <div
          v-if="selectedNum > 0"
          v-motion-fade
          class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center"
        >
          <div class="flex-auto">
            <span
              style="font-size: var(--el-font-size-base)"
              class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]"
            >
              已选 {{ selectedNum }} 项
            </span>
            <el-button type="primary" text @click="onSelectionCancel">
              取消选择
            </el-button>
          </div>
          <el-popconfirm title="是否确认删除?" @confirm="onBatchDel">
            <template #reference>
              <el-button type="danger" text class="mr-1"> 批量删除 </el-button>
            </template>
          </el-popconfirm>
        </div>
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
              :icon="useRenderIcon(View as any)"
              @click="handlePreview(row)"
            >
              预览
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Download as any)"
              @click="handleDownload(row)"
            >
              下载
            </el-button>
            <el-popconfirm
              :title="`是否确认删除文件名为 [${row.fileName}] 的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete as any)"
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
.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
