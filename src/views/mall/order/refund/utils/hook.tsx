/**
 * 退款审核页：管理端分页查询退款单，支持通过 / 拒绝。
 */
import type { LoadingConfig, PaginationProps } from "@pureadmin/table";

import { ref, onMounted, reactive, type Ref } from "vue";
import { delay } from "@pureadmin/utils";
import { omsRefundAudit, omsRefundMgrPage } from "@/api/oms";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";

/**
 * 退款审核表格状态与方法
 * @param tableRef 表格实例
 */
export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const selectedNum = ref(0);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 70
    },
    {
      label: "退款单号",
      prop: "refundNo",
      minWidth: 160
    },
    {
      label: "订单编号",
      prop: "orderCode",
      minWidth: 140
    },
    {
      label: "退款金额",
      prop: "refundAmount",
      width: 110
    },
    {
      label: "退款原因",
      prop: "reason",
      minWidth: 180,
      showOverflowTooltip: true
    },
    {
      label: "状态",
      prop: "refundStatus",
      width: 100,
      cellRenderer: ({ row }) => {
        if (row.refundStatus === 0) {
          return "待审核";
        }
        if (row.refundStatus === 1) {
          return "已通过";
        }
        if (row.refundStatus === 2) {
          return "已拒绝";
        }
        if (row.refundStatus === 3) {
          return "已取消";
        }
        return "-";
      }
    },
    {
      label: "申请时间",
      prop: "createTime",
      minWidth: 160
    },
    {
      label: "审核备注",
      prop: "auditRemark",
      minWidth: 140,
      showOverflowTooltip: true
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  const form = reactive({
    refundNo: "",
    orderCode: "",
    refundStatus: null as number | null
  });
  const dataList = ref([]);
  const pagination = reactive<PaginationProps>({
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    total: 0,
    align: "right",
    background: true
  });

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
  });

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
    omsRefundMgrPage(queryFilter).then(data => {
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
    form.refundNo = "";
    form.orderCode = "";
    form.refundStatus = null;
    onSearch();
  };

  function handleApprove(row) {
    ElMessageBox.confirm(
      `确认通过退款单 ${row.refundNo}？将退回余额并回补库存。`,
      "审核通过",
      {
        confirmButtonText: "通过",
        cancelButtonText: "取消",
        type: "warning"
      }
    )
      .then(() =>
        omsRefundAudit({
          refundId: row.id,
          pass: true
        })
      )
      .then(res => {
        if (res.code === 200) {
          message("审核通过", { type: "success" });
          onSearch();
        } else {
          message(res.msg || "审核失败", { type: "error" });
        }
      })
      .catch(() => {});
  }

  function handleReject(row) {
    ElMessageBox.prompt("请填写拒绝原因", "审核拒绝", {
      confirmButtonText: "拒绝",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPlaceholder: "审核备注（必填）",
      inputValidator: value => {
        if (!value || !String(value).trim()) {
          return "拒绝时必须填写审核备注";
        }
        return true;
      }
    })
      .then(({ value }) =>
        omsRefundAudit({
          refundId: row.id,
          pass: false,
          auditRemark: String(value).trim()
        })
      )
      .then(res => {
        if (res.code === 200) {
          message("已拒绝退款", { type: "success" });
          onSearch();
        } else {
          message(res.msg || "审核失败", { type: "error" });
        }
      })
      .catch(() => {});
  }

  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    tableRef.value?.setAdaptive?.();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onCurrentChange(val);
    onSearch();
  }

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
    handleApprove,
    handleReject,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange
  };
}
