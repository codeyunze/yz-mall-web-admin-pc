import dayjs from "dayjs";
import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection, hideTextAtIndex } from "@pureadmin/utils";
// import { tableDataMore } from "../../../table/base/data";
import {
  addRole,
  bindMenuForRole,
  deleteRoleById,
  getRoleList,
  getRoleMenu,
  getRoleMenuIds,
  getUserList,
  switchRoleStatus,
  updateRoleById
} from "@/api/system";
import {
  type Ref,
  reactive,
  ref,
  onMounted,
  h,
  toRaw,
  watch,
  computed
} from "vue";

export function useRole(treeRef: Ref) {
  const form = reactive({
    id: "",
    roleName: "",
    roleCode: "",
    status: ""
  });
  const currentPage = ref(1);
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const isShowUser = ref(false);
  const loading = ref(true);
  const isLinkage = ref(false);
  const treeSearchValue = ref();
  const userSearchValue = ref();
  const userLoading = ref(false);
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();
  const tableData = ref();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "角色名称",
      prop: "roleName"
    },
    {
      label: "角色标识",
      prop: "roleCode"
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 90
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 250,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });

  const userColumns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      width: 120
    },
    {
      label: "手机号",
      prop: "phone",
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    }
  ];

  // 当前操作角色Id
  const currentRoleId = ref(null);
  // 用户信息过滤
  const userFilter = ref("");
  const onLoadMoreUser = () => {
    if (!currentRoleId.value) {
      return;
    }
    currentPage.value++;
    const param = {
      filter: {
        roleId: currentRoleId.value,
        comprehensive: userFilter.value
      },
      current: currentPage.value
    };
    getUserList(toRaw(param)).then(data => {
      if (data.code !== 0 || data.data.items.length === 0) {
        userLoading.value = false;
      }

      for (let i = data.data.items.length - 1; i >= 0; i--) {
        tableData.value.push(data.data.items[i]);
      }
      setTimeout(() => {
        userLoading.value = false;
      }, 300);
    });
  };

  function onChange({ row, index }) {
    if (row.roleCode === "admin") {
      message(`超级管理员角色不能停用`, {
        type: "warning"
      });
      row.status === 0 ? (row.status = 1) : (row.status = 0);
      return;
    }
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.roleName
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        switchRoleStatus(row.id).then(res => {
          if (res.code === 0) {
            switchLoadMap.value[index] = Object.assign(
              {},
              switchLoadMap.value[index],
              {
                loading: false
              }
            );
            message(`已${row.status === 0 ? "停用" : "启用"}${row.roleName}`, {
              type: "success"
            });
          } else {
            row.status === 0 ? (row.status = 1) : (row.status = 0);
            message(
              `${row.status === 0 ? "停用" : "启用"}${row.roleName}失败`,
              {
                type: "error"
              }
            );
          }
        });
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleDelete(row) {
    deleteRoleById(row.id).then(res => {
      if (res.code === 0) {
        onSearch();
        message(`您删除了角色名称为${row.roleName}的这条数据`, {
          type: "success"
        });
      } else {
        message(res.msg, { type: "error" });
      }
    });
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function displayOperationButton(row) {
    return row.roleCode !== "admin";
  }

  async function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: form
    };
    const { data } = await getRoleList(toRaw(queryFilter));
    dataList.value = data.items;
    pagination.total = Number(data.total);

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          id: row?.id ?? "",
          roleName: row?.roleName ?? "",
          roleCode: row?.roleCode ?? "",
          remark: row?.remark ?? "",
          orgId: row?.orgId ?? -1
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了角色名称为${curData.roleName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              addRole(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message(res.msg, {
                    type: "warning"
                  });
                }
              });
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              updateRoleById(curData).then(res => {
                if (res.code === 0) {
                  chores();
                } else {
                  message(res.msg, {
                    type: "warning"
                  });
                }
              });
            }
          }
        });
      }
    });
  }

  /** 菜单权限 */
  async function handleMenu(row?: any) {
    isShowUser.value = false;
    const { id } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      // 查询选择角色所拥有的所有菜单
      const { data } = await getRoleMenuIds(id);
      // console.log("角色菜单", JSON.stringify(data));
      treeRef.value.setCheckedKeys(data);
      // console.log(JSON.stringify(treeRef.value));
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 成员信息 */
  async function handleUser(row?: any) {
    userLoading.value = true;
    curRow.value = null;
    isShow.value = true;
    tableData.value = null;
    isShowUser.value = true;
    currentPage.value = 1;
    currentRoleId.value = row.id;
    userFilter.value = "";

    const param = {
      filter: {
        roleId: currentRoleId.value,
        comprehensive: userFilter.value
      },
      current: currentPage.value
    };
    getUserList(toRaw(param)).then(data => {
      if (data.code === 0) {
        tableData.value = data.data.items;
        setTimeout(() => {
          userLoading.value = false;
        }, 300);
      }
    });
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  function handleSave() {
    const { id, roleName } = curRow.value;
    console.log("参数信息", JSON.stringify(curRow.value));
    // 根据角色 id 调用实际项目中菜单权限修改接口
    console.log(id, treeRef.value.getCheckedKeys());
    bindMenuForRole({
      roleId: id,
      menuIds: treeRef.value.getCheckedKeys()
    }).then(res => {
      if (res.code === 0) {
        message(`角色名称为 [${roleName}] 的菜单权限修改成功`, {
          type: "success"
        });
      } else {
        message(res.msg, { type: "error" });
      }
    });
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const onQueryUserChanged = (query: string) => {
    // treeRef.value!.filter(query);
    userLoading.value = true;
    tableData.value = null;
    currentPage.value = 1;
    userFilter.value = query;
    const param = {
      filter: {
        roleId: currentRoleId.value,
        comprehensive: userFilter.value
      },
      current: currentPage.value
    };
    getUserList(toRaw(param)).then(data => {
      if (data.code === 0) {
        tableData.value = data.data.items;
        setTimeout(() => {
          userLoading.value = false;
        }, 300);
      }
    });
  };

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };

  onMounted(async () => {
    onSearch();
    const { data } = await getRoleMenu();
    treeIds.value = getKeyList(data, "id");
    treeData.value = handleTree(data);
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  watch(userLoading, newValue => {
    if (newValue === true) {
      setTimeout(() => {
        userLoading.value = false;
      }, 3000);
    }
  });

  return {
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
    userFilter,
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
    onLoadMoreUser
  };
}
