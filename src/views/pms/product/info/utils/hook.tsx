import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, h, computed, type Ref } from "vue";
import { delay, deviceDetection, getKeyList } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/pms/product/info/form/index.vue";
import { message } from "@/utils/message";
import {
  addProduct,
  deleteProduct,
  delistingProductById,
  getProductPage,
  publishProductById,
  updateProductById
} from "@/api/pms";
import type { FormItemProps } from "@/views/pms/product/info/utils/types";
export { default as dayjs } from "dayjs";

export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const selectedNum = ref(0);
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
      label: "商品",
      prop: "name",
      align: "left"
    },
    {
      label: "标签",
      prop: "titles",
      minWidth: 200
    },
    {
      label: "售价（元）",
      prop: "price",
      width: 100
    },
    {
      label: "上架状态",
      prop: "publishStatus",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.publishStatus === 0 ? "danger" : null}
          effect="plain"
        >
          {row.publishStatus === 1 ? "上架" : "下架"}
        </el-tag>
      )
    },
    {
      label: "审核状态",
      prop: "verifyStatus",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={
            row.verifyStatus === 0
              ? "danger"
              : row.verifyStatus === 1
                ? "success"
                : "info"
          }
          effect="plain"
        >
          {row.verifyStatus === 0
            ? "未审核"
            : row.verifyStatus === 1
              ? "审核通过"
              : "待审核"}
        </el-tag>
      )
    },
    {
      label: "创建日期",
      prop: "createTime",
      width: 200
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const formRef = ref();
  const form = reactive({
    name: null,
    titles: null,
    publishStatus: null,
    verifyStatus: null,
    startTimeFilter: null,
    endTimeFilter: null
  });
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
    offsetBottom: 110,
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    timeout: 200
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
  };

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

    getProductPage(queryFilter).then(data => {
      dataList.value = data.data.items;
      pagination.total = Number(data.data.total);
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
      title: `${title}商品信息`,
      props: {
        formInline: {
          title,
          id: row?.id ?? 0,
          name: row?.name ?? "",
          remark: row?.remark ?? "",
          titles: row?.titles ?? "",
          price: row?.price ?? "",
          publishStatus: row?.publishStatus ?? 1,
          verifyStatus: row?.verifyStatus ?? 1,
          albumPics: row?.albumPics ?? ""
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
      hideFooter: title !== "编辑" && title !== "新增",
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了商品名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (!valid) {
            return;
          }

          // 表单规则校验通过
          if (title === "新增") {
            // 实际开发先调用新增接口，再进行下面操作
            addProduct(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          } else {
            console.log(curData);
            // 实际开发先调用修改接口，再进行下面操作
            updateProductById(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          }
        });
      }
    });
  }

  /**
   * 商品上架
   * @param row 商品信息
   */
  function handlePublish(row) {
    publishProductById(row.id).then(res => {
      if (res.code === 0) {
        message(`商品 [${row.name}] 上架成功`, {
          type: "success"
        });
        onSearch();
      }
    });
  }

  /**
   * 商品下架
   * @param row 商品信息
   */
  function handleDelisting(row) {
    delistingProductById(row.id).then(res => {
      if (res.code === 0) {
        message(`商品 [${row.name}] 下架成功`, {
          type: "success"
        });
        onSearch();
      }
    });
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

  /**
   * 设置一页数据量
   * @param val 一页展示的数据量
   */
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  /**
   * 翻页
   * @param val 页码
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
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
   * 删除商品信息
   * @param row 商品信息
   */
  function handleDelete(row) {
    deleteProduct(row.id).then(res => {
      if (res.code === 0) {
        onSearch();
        message(`您删除了商品名称为 [${row.username}] 的这条数据`, {
          type: "success"
        });
      }
    });
  }

  function handleUpdate(row) {
    console.log(row);
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
    onCurrentChange,
    openDialog,
    handlePublish,
    handleDelisting,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange,
    onSelectionCancel,
    onBatchDel,
    handleDelete,
    handleUpdate
  };
}
