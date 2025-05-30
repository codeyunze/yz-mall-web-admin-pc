<script setup lang="ts">
import { useRole } from "./utils/hook";
import { ref, computed, nextTick, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  delay,
  subBefore,
  deviceDetection,
  useResizeObserver
} from "@pureadmin/utils";

// import Database from "@iconify-icons/ri/database-2-line";
// import More from "@iconify-icons/ep/more-filled";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import Menu from "@iconify-icons/ep/menu";
import User from "@iconify-icons/ep/user";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Close from "@iconify-icons/ep/close";
import Check from "@iconify-icons/ep/check";
import More from "@iconify-icons/ep/more-filled";

defineOptions({
  name: "SystemRole"
});

const iconClass = computed(() => {
  return [
    "w-[22px]",
    "h-[22px]",
    "flex",
    "justify-center",
    "items-center",
    "outline-none",
    "rounded-[4px]",
    "cursor-pointer",
    "transition-colors",
    "hover:bg-[#0000000f]",
    "dark:hover:bg-[#ffffff1f]",
    "dark:hover:text-[#ffffffd9]"
  ];
});

const treeRef = ref();
const formRef = ref();
const tableRef = ref();
const contentRef = ref();
const treeHeight = ref();

const {
  form,
  isShow,
  isShowUser,
  curRow,
  loading,
  columns,
  userColumns,
  rowStyle,
  dataList,
  treeData,
  treeProps,
  isLinkage,
  pagination,
  isExpandAll,
  isSelectAll,
  treeSearchValue,
  userSearchValue,
  userLoading,
  buttonClass,
  tableData,
  onSearch,
  resetForm,
  openDialog,
  handleMenu,
  handleUser,
  handleSave,
  handleDelete,
  filterMethod,
  transformI18n,
  onQueryChanged,
  onQueryUserChanged,
  // handleDatabase,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  displayOperationButton,
  onLoadMoreUser,
  adaptiveConfig
} = useRole(treeRef);

onMounted(() => {
  useResizeObserver(contentRef, async () => {
    await nextTick();
    delay(60).then(() => {
      treeHeight.value = parseFloat(
        subBefore(tableRef.value.getTableDoms().tableWrapper.style.height, "px")
      );
    });
  });
});
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
      style="border-radius: 10px"
    >
      <el-form-item label="角色名称：" prop="roleName">
        <el-input
          v-model="form.roleName"
          placeholder="请输入角色名称"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="角色标识：" prop="roleCode">
        <el-input
          v-model="form.roleCode"
          placeholder="请输入角色标识"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="已启用" value="1" />
          <el-option label="已停用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div
      ref="contentRef"
      :class="['flex', deviceDetection() ? 'flex-wrap' : '']"
    >
      <PureTableBar
        :class="[isShow && !deviceDetection() ? '!w-[60vw]' : 'w-full']"
        style="
          border-radius: 10px;
          transition: width 220ms cubic-bezier(0.4, 0, 0.2, 1);
        "
        title="角色管理"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增角色
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            ref="tableRef"
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            :row-style="rowStyle"
            :adaptiveConfig="{ offsetBottom: 108 }"
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
                v-if="!displayOperationButton(row)"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(Menu)"
                @click="handleMenu(row)"
              >
                菜单权限
              </el-button>
              <el-button
                v-if="!displayOperationButton(row)"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(User)"
                @click="handleUser(row)"
              >
                成员信息
              </el-button>
              <el-button
                v-if="displayOperationButton(row)"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog('修改', row)"
              >
                修改
              </el-button>
              <el-popconfirm
                :title="`是否确认删除角色名称为 [${row.roleName}] 的这条数据`"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    v-if="displayOperationButton(row)"
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
              <el-dropdown v-if="displayOperationButton(row)">
                <el-button
                  class="ml-3 mt-[2px]"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(More)"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(Menu)"
                        @click="handleMenu(row)"
                      >
                        菜单权限
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        :class="buttonClass"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon(User)"
                        @click="handleUser(row)"
                      >
                        成员信息
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <!-- <el-dropdown>
              <el-button
                class="ml-3 mt-[2px]"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(More)"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <el-button
                      :class="buttonClass"
                      link
                      type="primary"
                      :size="size"
                      :icon="useRenderIcon(Menu)"
                      @click="handleMenu"
                    >
                      菜单权限
                    </el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button
                      :class="buttonClass"
                      link
                      type="primary"
                      :size="size"
                      :icon="useRenderIcon(Database)"
                      @click="handleDatabase"
                    >
                      数据权限
                    </el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown> -->
            </template>
          </pure-table>
        </template>
      </PureTableBar>

      <div
        v-if="isShow"
        v-loading="userLoading"
        class="!min-w-[calc(100vw-60vw-268px)] w-full mt-2 px-2 pb-2 bg-bg_color ml-2 overflow-auto"
        style="border-radius: 10px"
      >
        <div class="flex justify-between w-full px-3 pt-5 pb-4">
          <div class="flex">
            <span :class="iconClass">
              <IconifyIconOffline
                v-tippy="{
                  content: '关闭'
                }"
                class="dark:text-white"
                width="18px"
                height="18px"
                :icon="Close"
                @click="handleMenu"
              />
            </span>
            <span :class="[iconClass, 'ml-2']">
              <IconifyIconOffline
                v-tippy="{
                  content: '保存菜单权限'
                }"
                class="dark:text-white"
                width="18px"
                height="18px"
                :icon="Check"
                @click="handleSave"
              />
            </span>
          </div>
          <p v-if="!isShowUser" class="font-bold truncate">
            菜单权限
            {{ `${curRow?.roleName ? `（${curRow.roleName}）` : ""}` }}
          </p>
          <p v-if="isShowUser" class="font-bold truncate">
            成员信息
            {{ `${curRow?.roleName ? `（${curRow.roleName}）` : ""}` }}
          </p>
        </div>
        <el-input
          v-if="!isShowUser"
          v-model="treeSearchValue"
          placeholder="请输入菜单进行搜索"
          class="mb-1"
          clearable
          @input="onQueryChanged"
        />
        <el-input
          v-else
          v-model="userSearchValue"
          placeholder="请输入用户名称或手机号进行搜索"
          class="mb-1"
          clearable
          @input="onQueryUserChanged"
        />
        <div v-if="!isShowUser" class="flex flex-wrap">
          <el-checkbox v-model="isExpandAll" label="展开/折叠" />
          <el-checkbox v-model="isSelectAll" label="全选/全不选" />
          <el-checkbox v-model="isLinkage" label="父子联动" />
        </div>
        <el-tree-v2
          v-if="!isShowUser"
          ref="treeRef"
          show-checkbox
          :data="treeData"
          :props="treeProps"
          :height="treeHeight"
          :check-strictly="!isLinkage"
          :filter-method="filterMethod"
        >
          <template #default="{ node }">
            <span>{{ transformI18n(node.label) }}</span>
          </template>
        </el-tree-v2>

        <pure-table
          v-if="isShowUser"
          ref="tableRef"
          adaptive
          :adaptiveConfig="adaptiveConfig"
          row-key="id"
          alignWhole="center"
          showOverflowTooltip
          :data="tableData"
          :columns="userColumns"
        />
        <el-button
          v-if="isShowUser"
          class="mt-4"
          style="width: 100%"
          @click="onLoadMoreUser"
        >
          加载更多
        </el-button>
      </div>
    </div>
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
