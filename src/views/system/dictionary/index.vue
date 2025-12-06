<script setup lang="ts">
import { ref } from "vue";
import { useDictionary, dayjs } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";

defineOptions({
  name: "SystemDictionaryManage"
});

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
  openDialog,
  handleDelete,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,
  onSelectionCancel,
  onBatchDel,
  loadChildren
} = useDictionary(tableRef);

const state = ref({
  dictionaryKey: "",
  dictionaryValue: "",
  invalid: "",
  createTime: null
});

const filterColumns: PlusColumn[] = [
  {
    label: "字典键",
    prop: "dictionaryKey"
  },
  {
    label: "字典值",
    prop: "dictionaryValue"
  },
  {
    label: "状态",
    prop: "invalid",
    valueType: "select",
    options: [
      {
        label: "有效",
        value: "0",
        color: "green"
      },
      {
        label: "无效",
        value: "1",
        color: "red"
      }
    ]
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

const handleChange = (_values: Record<string, unknown>) => {
  // 搜索条件变化时的回调
};

const handleSearch = (values: Record<string, unknown>) => {
  form.dictionaryKey = values.dictionaryKey || null;
  form.dictionaryValue = values.dictionaryValue || null;
  form.invalid = values.invalid || null;
  if (values.createTime) {
    form.startTimeFilter = dayjs(values.createTime[0]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    form.endTimeFilter = dayjs(values.createTime[1]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  } else {
    form.startTimeFilter = null;
    form.endTimeFilter = null;
  }
  pagination.currentPage = 1;
  onSearch();
};

const handleRest = () => {
  form.dictionaryKey = null;
  form.dictionaryValue = null;
  form.invalid = null;
  form.startTimeFilter = null;
  form.endTimeFilter = null;
  pagination.currentPage = 1;
  onSearch();
};

function onFullscreen() {
  // 重置表格高度
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
      title="数据字典管理"
      :columns="columns"
      style="border-radius: 10px"
      :isExpandAll="false"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
      @fullscreen="onFullscreen"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增字典
        </el-button>
      </template>
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
          showOverflowTooltip
          lazy
          :load="loadChildren"
          :tree-props="{
            hasChildren: 'hasChildren',
            children: 'children',
            checkStrictly: false
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
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
            >
              修改
            </el-button>
            <el-button
              v-show="!row.children || row.children.length === 0"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(AddFill)"
              @click="openDialog('新增', { parentId: row.id })"
            >
              新增
            </el-button>
            <el-popconfirm
              :title="`是否确认删除字典值为${row.dictionaryValue}的这条数据${row?.children?.length > 0 ? '。注意下级字典也会一并删除，请谨慎操作' : ''}`"
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
.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

// 修复选择列对齐问题
:deep(.el-table__header-wrapper) {
  .el-table__header {
    th.el-table__cell {
      &.el-table-column--selection {
        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}

:deep(.el-table__body-wrapper) {
  .el-table__body {
    td.el-table__cell {
      &.el-table-column--selection {
        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
</style>
