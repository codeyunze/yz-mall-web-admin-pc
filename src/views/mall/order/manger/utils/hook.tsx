/**
 * 订单管理（后台）页组合式逻辑：管理员分页列表（omsOrderMgrPage）、详情抽屉、待付款取消等。
 */
import type { LoadingConfig, PaginationProps } from "@pureadmin/table";

import { ref, onMounted, reactive, type Ref } from "vue";
import { delay } from "@pureadmin/utils";
import { getOmsInfo, omsOrderMgrCancel, omsOrderMgrPage } from "@/api/oms";
import { usePublicHooks } from "@/views/system/hooks";
import { addDrawer, closeDrawer } from "@/components/ReDrawer/index";
import forms from "../../form.vue";
import { message } from "@/utils/message";
export { default as dayjs } from "dayjs";

/**
 * 订单管理表格与抽屉相关状态与方法。
 * @param tableRef 表格实例，用于勾选后重置自适应高度
 */
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
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.orderStatus === 1 ? 1 : 2)}
        >
          {row.orderStatus === 1
            ? "待发货"
            : row.orderStatus === 0
              ? "待付款"
              : row.orderStatus === 2
                ? "已发货"
                : row.orderStatus === 3
                  ? "待收货"
                  : row.orderStatus === 4
                    ? "已完成"
                    : row.orderStatus === 5
                      ? "已取消"
                      : row.orderStatus === 7
                        ? "退款中"
                        : row.orderStatus === 8
                          ? "已退款"
                          : "无效订单"}
        </el-tag>
      )
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

  /** 分页或每页条数变化时更新加载文案 */
  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      loading.value = false;
    });
  }

  /** 按当前 form 与 pagination 请求管理端订单分页数据 */
  function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: form
    };

    omsOrderMgrPage(queryFilter).then(data => {
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
   * 与「我的订单」侧一致：用于待付款订单在操作后控制底部按钮显示（如支付流程扩展）。
   */
  const showOperationButtons = ref(true);

  /**
   * 打开订单详情抽屉；管理端待付款时展示取消等操作。
   * @param title 抽屉标题
   * @param orderCode 订单编号
   */
  function openDialog(title = "订单详情", orderCode?: string) {
    const queryFilter = {
      orderCode
    };
    getOmsInfo(queryFilter).then(data => {
      if (data.code !== 200) {
        return;
      }
      console.log("订单详情数据", data.data);
      addDrawer({
        size: "60%",
        title: title,
        contentRenderer: () => forms,
        props: {
          // 订单详情表单初值（接口返回）
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
    omsOrderMgrCancel(options.props.formInline.id).then(result => {
      if (result.code === 200) {
        message("订单已取消", { type: "success" });
        onSearch();
        closeDrawer(options, index);
      } else {
        message(result.msg || "取消订单失败", { type: "error" });
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
    onSearch,
    resetForm,
    openDialog,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange
  };
}
