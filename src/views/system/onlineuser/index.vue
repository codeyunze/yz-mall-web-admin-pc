<script setup lang="ts">
import { ref } from "vue";
import { useOnlineUser } from "./utils/hook";

import "plus-pro-components/es/components/search/style/css";

import { type PlusColumn, PlusSearch } from "plus-pro-components";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Remove from "@iconify-icons/ep/remove";

defineOptions({
  name: "SystemOnlineUser"
});

const {
  loading,
  columns,
  form,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange,
  handleKickout
} = useOnlineUser();

const state = ref({
  username: ""
});

const filterColumns: PlusColumn[] = [
  {
    label: "用户名",
    prop: "username"
  }
];

const handleChange = (values: Record<string, unknown>) => {
  console.log(values, "change");
};

const handleSearch = (values: Record<string, unknown>) => {
  form.username = (values.username as string) || null;
  pagination.currentPage = 1;
  onSearch();
};

const handleRest = () => {
  state.value = {
    username: ""
  };
  resetForm();
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
      title="在线用户管理"
      :columns="columns"
      style="border-radius: 10px"
      @refresh="onSearch"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          row-key="userId"
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
              type="danger"
              :icon="useRenderIcon(Remove as any)"
              link
              @click="handleKickout(row.userId)"
            >
              踢下线
            </el-button>
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
