import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, computed, type Ref } from "vue";
import { delay } from "@pureadmin/utils";
import { getOmsInfo, omsOrderCancel, omsOrderPage, omsPay } from "@/api/oms";
import { usePublicHooks } from "@/views/system/hooks";
import { addDrawer, closeDrawer } from "@/components/ReDrawer/index";
import forms from "../form.vue";
import { message } from "@/utils/message";
export { default as dayjs } from "dayjs";

export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const { tagStyle } = usePublicHooks();
  const selectedNum = ref(0);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "订单编号",
      prop: "orderCode"
    },
    {
      label: "订单类型",
      prop: "orderType",
      cellRenderer: ({ row }) =>
        // 0正常订单；1秒杀订单
        row.orderType === 1 ? "秒杀订单" : "正常订单"
    },
    {
      label: "订单状态",
      prop: "orderStatus",
      cellRenderer: ({ row }) => {
        // 0待付款；1待发货；2已发货；3待收货；4已完成；5已关闭/已取消；6无效订单
        if (row.orderStatus === 0) {
          return "待付款";
        } else if (row.orderStatus === 1) {
          return "待发货";
        } else if (row.orderStatus === 2) {
          return "已发货";
        } else if (row.orderStatus === 3) {
          return "待收货";
        } else if (row.orderStatus === 4) {
          return "已完成";
        } else if (row.orderStatus === 5) {
          return "已取消";
        } else if (row.orderStatus === 6) {
          return "无效订单";
        }
      }
    },
    {
      label: "收货状态",
      prop: "confirmStatus",
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.confirmStatus === 1 ? 1 : 2)}
        >
          {row.confirmStatus === 1 ? "已收货" : "未收货"}
        </el-tag>
      )
    },
    {
      label: "收货人姓名",
      prop: "receiverName"
    },
    {
      label: "收货人手机号",
      prop: "receiverPhone"
    },
    {
      label: "创建时间",
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
    orderCode: "",
    orderStatus: null,
    orderType: null,
    confirmStatus: null,
    payType: null,
    receiverPhone: null,
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

    omsOrderPage(queryFilter).then(data => {
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

  /**
   * 展开操作按钮
   */
  const showOperationButtons = ref(true);

  function openDialog(title = "订单详情", orderCode?: string) {
    const queryFilter = {
      orderCode
    };
    getOmsInfo(queryFilter).then(data => {
      if (data.code !== 0) {
        message(data.msg, {
          type: "error"
        });
        return;
      }
      console.log("订单详情数据", data.data);
      addDrawer({
        size: "60%",
        title: title,
        contentRenderer: () => forms,
        props: {
          // 赋默认值
          formInline: data.data
        },
        footerRenderer: ({ options, index }) => {
          const orderStatus = options.props.formInline.orderStatus;
          return (
            <div>
              {orderStatus === 0 && showOperationButtons.value && (
                <div>
                  <el-button onClick={() => orderCancelHandle(options, index)}>
                    取消订单
                  </el-button>
                  <el-button onClick={() => handleOrderUpdate(options, index)}>
                    修改订单
                  </el-button>
                  <el-button
                    type="success"
                    onClick={() => orderPayHandle(options, index)}
                  >
                    去支付
                  </el-button>
                </div>
              )}
              {(orderStatus === 1 ||
                orderStatus === 2 ||
                orderStatus === 3 ||
                !showOperationButtons.value) && <el-button>申请退款</el-button>}
              {orderStatus === 4 && <el-button>退款/售后</el-button>}
              {(orderStatus === 4 || orderStatus === 5) && (
                <el-button type="warning">再次购买</el-button>
              )}
            </div>
          );
        },
        closeCallBack: ({ options, args }) => {
          console.log(options, args);
        }
      });
    });
  }

  /**
   * 取消订单
   */
  function orderCancelHandle(options, index) {
    omsOrderCancel(options.props.formInline.id).then(result => {
      message(result.msg, { type: "success" });
      onSearch();
      closeDrawer(options, index);
    });
  }

  /**
   * 处理订单修改操作
   * @param options
   * @param index
   */
  function handleOrderUpdate(options, index) {
    console.log(options, index);
  }

  /**
   * 订单支付
   */
  function orderPayHandle(options, index) {
    console.log(options.props.formInline.id, index);
    const pay = {
      businessId: options.props.formInline.id,
      payType: 1
    };
    omsPay(pay).then(res => {
      if (0 === res.code) {
        message(res.msg, { type: "success" });
        onSearch();
        showOperationButtons.value = false;
        console.log("按钮状态：", showOperationButtons);
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
    onCurrentChange(val);
    onSearch();
  }

  /**
   * 翻页
   * @param val 页码
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onCurrentChange(val);
    onSearch();
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
    openDialog,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange
  };
}
