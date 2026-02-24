<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "@/views/pms/product/attr/utils/hook";
import { pmsProductInfo } from "@/api/pms";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";
import { PureTableBar } from "@/components/RePureTableBar";

defineOptions({
  name: "PmsAttrManage"
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
  productOptions,
  onSearch,
  resetForm,
  openDialog,
  handleSizeChange,
  handleCurrentChange,
  handleDelete,
  handleUpdate
} = useColumns();

const state = ref({
  productName: "",
  attrName: "",
  attrValue: ""
});

const filterColumns: PlusColumn[] = [
  {
    label: "商品名称",
    prop: "productName"
  },
  {
    label: "属性名称",
    prop: "attrName"
  },
  {
    label: "属性值",
    prop: "attrValue"
  }
];

const handleChange = (values: any) => {
  console.log(values, "change");
};

const handleSearch = async (values: any) => {
  // 先根据商品名称到后端做一次模糊匹配，拿到商品列表
  if (values.productName) {
    const res: any = await pmsProductInfo({
      queryInfo: values.productName
    });
    const list = res?.data || [];
    if (list.length === 1) {
      // 只有一个匹配结果，直接用这条商品的 ID 作为过滤条件
      form.relatedId = list[0].id;
    } else if (list.length > 1) {
      // 多条结果时，暂时不带 product 过滤，让用户缩小搜索范围
      form.relatedId = null;
    } else {
      // 未匹配到任何商品
      form.relatedId = null;
    }
  } else {
    form.relatedId = null;
  }
  form.attrName = values.attrName;
  form.attrValue = values.attrValue;
  // 保持默认过滤条件：只查询商品类型属性
  form.attrType = 0;
  onSearch();
};

const handleRest = () => {
  form.relatedId = null;
  form.attrName = null;
  form.attrValue = null;
  // 重置时同样只查商品类型属性
  form.attrType = 0;
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
      title="商品属性管理"
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
          新增属性
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
            <el-popconfirm
              :title="`是否确认删除属性名称为 [${row.attrName}] 的这条数据`"
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
