<script setup lang="ts">
import { ref } from "vue";
import { useColumns, dayjs } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import EditPen from "@iconify-icons/ep/edit-pen";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";

defineOptions({
  name: "WebExampleOne"
});

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
  onCurrentChange,
  openDialog,
  handleDelete,
  handleUpdate
} = useColumns(tableRef);

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
  console.log("search");
  console.log(JSON.stringify(JSON.stringify(values)));
  form.phone = values.phone;
  form.email = values.email;
  console.log(values.createTime);
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
  console.log("handleRest");
  form.phone = null;
  form.email = null;
  form.startTimeFilter = null;
  form.endTimeFilter = null;
  onSearch();
};
</script>

<template>
  <el-card shadow="never">
    <div class="main">
      <PlusSearch
        v-model="state"
        :columns="filterColumns"
        :show-number="2"
        label-width="80"
        style="margin-bottom: 20px"
        label-position="right"
        @change="handleChange"
        @search="handleSearch"
        @reset="handleRest"
      />

      <PureTableBar
        title="用户管理"
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
            新增用户
          </el-button>
        </template>
        <template v-slot="{ size }">
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
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(AddFill)"
                @click="openDialog('详情', row)"
              >
                详情
              </el-button>
              <el-popconfirm
                :title="`是否确认删除部门名称为 [${row.orgName}] 的这条数据`"
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
  </el-card>
</template>
