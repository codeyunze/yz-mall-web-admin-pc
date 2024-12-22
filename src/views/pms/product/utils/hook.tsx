import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { pageUserInfo } from "@/api/user";
import { ref, onMounted, reactive, h, computed, type Ref } from "vue";
import { delay, deviceDetection, getKeyList } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/system/user/form/index.vue";
import type {
  FormItemProps,
  RoleFormItemProps
} from "@/views/system/user/utils/types";
import { message } from "@/utils/message";
import {
  addUser,
  bindRoleForUser,
  deleteByUserId,
  getRoleIds,
  updateUserById
} from "@/api/system";
import roleForm from "@/views/system/user/form/role.vue";
export { default as dayjs } from "dayjs";

export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const selectedNum = ref(0);
  const higherDeptOptions = ref();
  const roleOptions = ref([]);
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "手机号",
      prop: "phone"
    },
    {
      label: "邮件",
      prop: "email"
    },
    {
      label: "创建日期",
      prop: "createTime"
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const form = reactive({
    phone: null,
    email: null,
    startTimeFilter: null,
    endTimeFilter: null
  });
  const formRef = ref();
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });
  const dataList = ref([]);
  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
    // svg: "",
    // background: rgba()
  });

  /** 撑满内容区自适应高度相关配置 */
  const adaptiveConfig: AdaptiveConfig = {
    /** 表格距离页面底部的偏移量，默认值为 `96` */
    offsetBottom: 110
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    // timeout: 60
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
  };

  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      loading.value = false;
    });
  }

  function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: form
    };
    console.log("请求过滤" + JSON.stringify(queryFilter));

    pageUserInfo(queryFilter).then(data => {
      console.log("接口数据" + JSON.stringify(data));
      dataList.value = data.data.items;
      pagination.total = data.data.total;
    });
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
      title: `${title}用户信息`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          id: row?.id ?? 0,
          username: row?.username ?? "",
          password: row?.password ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          sex: row?.sex ?? "",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      width: "46%",
      style: {
        "border-radius": "12px"
      },
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了用户名称为${curData.username}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            return;
          }
          // 表单规则校验通过
          if (title === "新增") {
            // 实际开发先调用新增接口，再进行下面操作
            addUser(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          } else {
            // 实际开发先调用修改接口，再进行下面操作
            updateUserById(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          }
        });
      }
    });
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /** 批量删除 */
  function onBatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  /**
   * 删除用户信息
   * @param row 用户信息
   */
  function handleDelete(row) {
    deleteByUserId(row.id).then(res => {
      if (res.code === 0) {
        onSearch();
        message(`您删除了用户名称为 [${row.username}] 的这条数据`, {
          type: "success"
        });
      }
    });
  }

  function handleUpdate(row) {
    console.log(row);
  }

  /** 分配角色 */
  async function handleRole(row) {
    // 选中的角色列表
    const ids = (await getRoleIds(row.id)).data ?? [];
    addDialog({
      title: `分配 [${row.username}] 用户的角色`,
      props: {
        formInline: {
          username: row?.username ?? "",
          roleOptions: roleOptions.value ?? [],
          ids
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;

        const bindRole = {
          relationId: row.id,
          type: 0,
          roleIds: curData.ids
        };

        bindRoleForUser(bindRole).then(res => {
          if (res.code === 0) {
            message("角色分配成功", {
              type: "success"
            });
            done(); // 关闭弹框
          }
        });
        // 根据实际业务使用curData.ids和row里的某些字段去调用修改角色接口即可
        done(); // 关闭弹框
      }
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    columns,
    form,
    dataList,
    pagination,
    selectedNum,
    loadingConfig,
    adaptiveConfig,
    buttonClass,
    onSearch,
    resetForm,
    onSizeChange,
    onCurrentChange,
    openDialog,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange,
    onSelectionCancel,
    onBatchDel,
    handleDelete,
    handleUpdate,
    handleRole
  };
}
