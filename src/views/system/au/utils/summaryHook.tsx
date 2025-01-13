import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, h, computed, type Ref } from "vue";
import { delay, deviceDetection } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/system/au/form/index.vue";
import { message } from "@/utils/message";
import type { FormItemProps } from "@/views/system/au/utils/types";
import {
  addAuRecord,
  deleteAuRecordById,
  getAuSummaryPage,
  updateAuRecordById
} from "@/api/au";
export { default as dayjs } from "dayjs";

export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const selectedNum = ref(0);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "ID",
      prop: "id"
    },
    {
      label: "交易价格（元/克）",
      prop: "price"
    },
    {
      label: "交易数量（克）",
      prop: "quantity"
    },
    {
      label: "交易总价（元）",
      prop: "priceTotal"
    },
    {
      label: "盈利金额（元）",
      prop: "profitAmount"
    },
    {
      label: "交易时间",
      prop: "transactionTime",
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
    id: null,
    transactionType: null,
    price: 0,
    quantity: 0,
    relationId: "",
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

    getAuSummaryPage(queryFilter).then(data => {
      dataList.value = data.data.items;
      dataList.value.forEach(item => {
        item.priceTotal = item.price * item.quantity;
        if (item.relationId == -1) {
          item.relationId = "";
        }
      });
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
      title: `${title}交易记录`,
      props: {
        formInline: {
          title: title === "查看" ? "详情" : title,
          id: row?.id ?? 0,
          transactionType: row?.transactionType ?? 0,
          price: row?.price ?? 0,
          quantity: row?.quantity ?? 0,
          relationId: row?.relationId ?? "",
          transactionTime: row?.transactionTime ?? null,
          profitAmount: row?.profitAmount ?? 0
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
      contentRenderer: () =>
        h(editForm, {
          ref: formRef,
          formInline: null
        }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        if (1 === curData.transactionType) {
        }
        function chores() {
          message("操作成功", {
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
            addAuRecord(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          } else {
            // 实际开发先调用修改接口，再进行下面操作
            updateAuRecordById(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          }
        });
      }
    });
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

  /**
   * 删除交易记录信息
   * @param row 交易信息
   */
  function handleDelete(row) {
    deleteAuRecordById(row.id).then(res => {
      if (res.code === 0) {
        onSearch();
        message(`您删除了交易记录 [${row.id}] 的这条数据`, {
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
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange,
    handleDelete,
    handleUpdate
  };
}
