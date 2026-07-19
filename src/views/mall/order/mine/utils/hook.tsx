/**
 * 我的订单页组合式逻辑：分页列表（omsOrderMinePage）、详情抽屉（getOmsInfo + form.vue）、
 * 待付款状态下取消/假支付等操作。
 */
import type { LoadingConfig, PaginationProps } from "@pureadmin/table";

import { ref, onMounted, reactive, watch, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { delay } from "@pureadmin/utils";
import {
  getOmsInfo,
  omsOrderCancel,
  omsOrderMinePage,
  omsPay,
  omsRefundApply
} from "@/api/oms";
import { usePublicHooks } from "@/views/system/hooks";
import { addDrawer, closeDrawer } from "@/components/ReDrawer";
import forms from "../../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
export { default as dayjs } from "dayjs";

/**
 * 我的订单表格与抽屉相关状态与方法。
 * @param tableRef 表格实例，用于勾选后重置自适应高度
 */
export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const route = useRoute();
  const router = useRouter();
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
        // 0待付款；1待发货；2已发货；3待收货；4已完成；5已关闭/已取消；6无效订单；7退款中；8已退款
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
        } else if (row.orderStatus === 7) {
          return "退款中";
        } else if (row.orderStatus === 8) {
          return "已退款";
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

  /** 分页或每页条数变化时更新加载文案（与 delay 配合的占位动画） */
  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      loading.value = false;
    });
  }

  /** 按当前 form 与 pagination 请求我的订单分页数据 */
  function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: form
    };

    omsOrderMinePage(queryFilter).then(data => {
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
   * 待付款订单在支付成功后置为 false，用于隐藏「取消 / 修改 / 去支付」按钮，避免重复操作。
   */
  const showOperationButtons = ref(true);

  /**
   * 打开订单详情抽屉；待付款时展示取消、修改、去支付等底部操作。
   * @param title 抽屉标题
   * @param orderCode 订单编号，用于拉取详情
   */
  function openDialog(title = "订单详情", orderCode?: string) {
    if (!orderCode) {
      return;
    }
    showOperationButtons.value = true;
    const queryFilter = {
      orderCode
    };
    getOmsInfo(queryFilter).then(data => {
      if (data.code !== 200) {
        message(data.msg || "获取订单详情失败", { type: "error" });
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
              {orderStatus === 1 && (
                <el-button
                  type="warning"
                  onClick={() => orderRefundApplyHandle(options, index)}
                >
                  申请退款
                </el-button>
              )}
              {orderStatus === 7 && <el-button disabled>退款审核中</el-button>}
              {orderStatus === 8 && <el-button disabled>已退款</el-button>}
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

  watch(
    () => route?.query?.orderCode,
    orderCode => {
      if (orderCode && route?.path?.startsWith("/mall/order/mine")) {
        openDialog("订单详情", String(orderCode));
      }
    }
  );

  /**
   * 取消待付款订单：确认后调用接口，成功则关闭抽屉并刷新列表。
   */
  function orderCancelHandle(options, index) {
    const order = options.props.formInline;
    ElMessageBox.confirm(
      `确认取消订单 ${order.orderCode}？取消后将释放已占用的库存。`,
      "取消订单",
      {
        confirmButtonText: "确认取消",
        cancelButtonText: "再想想",
        type: "warning"
      }
    )
      .then(() => omsOrderCancel(order.id))
      .then(result => {
        if (result.code === 200) {
          message("订单已取消", { type: "success" });
          onSearch();
          closeDrawer(options, index);
        } else {
          message(result.msg || "取消订单失败", { type: "error" });
        }
      })
      .catch(() => {});
  }

  /**
   * 修改订单（占位，具体跳转或表单待产品对接）
   * @param options 抽屉 options
   * @param index 抽屉索引
   */
  function handleOrderUpdate(options, index) {
    console.log(options, index);
  }

  /**
   * 待发货订单申请退款：填写原因后提交，成功则刷新并重新打开详情。
   */
  function orderRefundApplyHandle(options, index) {
    const order = options.props.formInline;
    ElMessageBox.prompt("请填写退款原因", "申请退款", {
      confirmButtonText: "提交",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPlaceholder: "请说明退款原因",
      inputValidator: value => {
        if (!value || !String(value).trim()) {
          return "退款原因不能为空";
        }
        if (String(value).trim().length > 500) {
          return "退款原因不能超过500字";
        }
        return true;
      }
    })
      .then(({ value }) => {
        return omsRefundApply({
          orderId: order.id,
          reason: String(value).trim()
        }).then(res => {
          if (res.code === 200) {
            message("退款申请已提交", { type: "success" });
            closeDrawer(options, index);
            onSearch();
            openDialog("订单详情", order.orderCode);
          } else {
            message(res.msg || "申请退款失败", { type: "error" });
          }
        });
      })
      .catch(() => {});
  }

  /**
   * 假支付：成功后提示、关闭当前抽屉，并跳转我的订单打开对应详情。
   */
  function orderPayHandle(options, index) {
    const order = options.props.formInline;
    const pay = {
      businessId: order.id,
      payType: 1
    };
    omsPay(pay).then(res => {
      if (res.code === 200) {
        message("支付成功", { type: "success" });
        closeDrawer(options, index);
        onSearch();
        const orderCode = order.orderCode;
        if (route?.path?.startsWith("/mall/order/mine")) {
          openDialog("订单详情", orderCode);
        } else {
          router.push({
            path: "/mall/order/mine",
            query: { orderCode }
          });
        }
      } else {
        message(res.msg || "支付失败", { type: "error" });
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
    const orderCode = route.query.orderCode;
    if (orderCode) {
      openDialog("订单详情", String(orderCode));
    }
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
