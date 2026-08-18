<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "@/views/tw/model/utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";

defineOptions({
  name: "TwVehicleModelManage"
});

const tableRef = ref();

const {
  loading,
  columns,
  form,
  dataList,
  pagination,
  adaptiveConfig,
  buttonClass,
  onSearch,
  resetForm,
  openDialog,
  handleSizeChange,
  handleCurrentChange,
  handleToggleStatus,
  handleDelete
} = useColumns();

const state = ref({
  seriesId: null,
  seriesCode: "",
  modelCode: "",
  modelName: "",
  status: null,
  energyType: null
});

const filterColumns: PlusColumn[] = [
  {
    label: "车系ID",
    prop: "seriesId"
  },
  {
    label: "车系编码",
    prop: "seriesCode"
  },
  {
    label: "车型编码",
    prop: "modelCode"
  },
  {
    label: "车型名称",
    prop: "modelName"
  },
  {
    label: "能源类型",
    prop: "energyType",
    valueType: "select",
    options: [
      { label: "纯电", value: 1 },
      { label: "插混", value: 2 },
      { label: "增程", value: 3 },
      { label: "燃油", value: 4 }
    ]
  },
  {
    label: "状态",
    prop: "status",
    valueType: "select",
    options: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 }
    ]
  }
];

const handleChange = (values: any) => {
  console.log(values, "change");
};

const handleSearch = (values: any) => {
  form.seriesId = values.seriesId;
  form.seriesCode = values.seriesCode;
  form.modelCode = values.modelCode;
  form.modelName = values.modelName;
  form.energyType = values.energyType;
  form.status = values.status;
  onSearch();
};

const handleRest = () => {
  form.seriesId = null;
  form.seriesCode = null;
  form.modelCode = null;
  form.modelName = null;
  form.energyType = null;
  form.status = null;
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
      title="车型管理"
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
          新增车型
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
              @click="openDialog('编辑', row)"
            >
              修改
            </el-button>
            <el-button
              class="reset-margin"
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              :size="size"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? "禁用" : "启用" }}
            </el-button>
            <el-popconfirm
              :title="`是否确认删除车型 [${row.modelName}] 的这条数据`"
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
