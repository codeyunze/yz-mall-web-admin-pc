import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { getMsgRetryList, getMsgRetryDetail } from "@/api/system";
import { ref, onMounted, reactive } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import type { MsgRetryItemProps, MsgRetryQueryForm } from "./types";

export { default as dayjs } from "dayjs";

export function useMsgRetry() {
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "消息ID",
      prop: "msgId",
      minWidth: 200
    },
    {
      label: "业务ID",
      prop: "businessId",
      minWidth: 150
    },
    {
      label: "Topic",
      prop: "topic",
      minWidth: 150
    },
    {
      label: "Tag标签",
      prop: "tags",
      minWidth: 150
    },
    {
      label: "消费者组",
      prop: "consumerGroup",
      minWidth: 150
    },
    {
      label: "状态",
      prop: "status",
      width: 120,
      cellRenderer: ({ row }) => {
        const statusMap: Record<number, { text: string; type: string }> = {
          0: { text: "重试中", type: "warning" },
          1: { text: "待处理", type: "danger" },
          2: { text: "已处理", type: "success" },
          3: { text: "已忽略", type: "info" }
        };
        const status = statusMap[row.status] || { text: "未知", type: "info" };
        return <el-tag type={status.type}>{status.text}</el-tag>;
      }
    },
    {
      label: "剩余重试次数",
      prop: "retryCount",
      width: 120
    },
    {
      label: "下次重试时间",
      prop: "nextRetryTime",
      width: 180
    },
    {
      label: "创建时间",
      prop: "createTime",
      width: 180
    },
    {
      label: "操作",
      fixed: "right",
      width: 120,
      slot: "operation"
    }
  ];

  const form = reactive<MsgRetryQueryForm>({
    msgId: null,
    businessId: null,
    topic: null,
    tags: null,
    consumerGroup: null,
    status: null,
    createTimeStart: null,
    createTimeEnd: null
  });

  const dataList = ref<MsgRetryItemProps[]>([]);
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
  });

  /** 撑满内容区自适应高度相关配置 */
  const adaptiveConfig: AdaptiveConfig = {
    offsetBottom: 110,
    timeout: 200
  };

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const queryFilter: any = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: {}
    };

    // 构建查询条件
    if (form.msgId) {
      queryFilter.filter.msgId = form.msgId;
    }
    if (form.businessId) {
      queryFilter.filter.businessId = form.businessId;
    }
    if (form.topic) {
      queryFilter.filter.topic = form.topic;
    }
    if (form.tags) {
      queryFilter.filter.tags = form.tags;
    }
    if (form.consumerGroup) {
      queryFilter.filter.consumerGroup = form.consumerGroup;
    }
    if (form.status !== null && form.status !== undefined) {
      queryFilter.filter.status = form.status;
    }
    if (form.createTimeStart) {
      queryFilter.filter.createTimeStart = form.createTimeStart;
    }
    if (form.createTimeEnd) {
      queryFilter.filter.createTimeEnd = form.createTimeEnd;
    }

    try {
      const { data } = await getMsgRetryList(queryFilter);
      if (data?.items) {
        dataList.value = data.items;
        pagination.total = Number(data.total || 0);
      } else {
        dataList.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error("查询消息重试列表失败:", error);
      message("查询失败，请稍后重试", { type: "error" });
      dataList.value = [];
      pagination.total = 0;
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  }

  const resetForm = () => {
    form.msgId = null;
    form.businessId = null;
    form.topic = null;
    form.tags = null;
    form.consumerGroup = null;
    form.status = null;
    form.createTimeStart = null;
    form.createTimeEnd = null;
    pagination.currentPage = 1;
    onSearch();
  };

  /**
   * 查看详情
   */
  async function handleViewDetail(row: MsgRetryItemProps) {
    try {
      const { data } = await getMsgRetryDetail(row.id);
      if (data) {
        // 使用 ElMessageBox 显示详情
        const detailContent = `
          <div style="max-height: 500px; overflow-y: auto;">
            <p><strong>消息ID：</strong>${data.msgId || "-"}</p>
            <p><strong>业务ID：</strong>${data.businessId || "-"}</p>
            <p><strong>Topic：</strong>${data.topic || "-"}</p>
            <p><strong>标签：</strong>${data.tags || "-"}</p>
            <p><strong>消费者组：</strong>${data.consumerGroup || "-"}</p>
            <p><strong>剩余重试次数：</strong>${data.retryCount || 0}</p>
            <p><strong>下次重试时间：</strong>${data.nextRetryTime || "-"}</p>
            <p><strong>创建时间：</strong>${data.createTime || "-"}</p>
            <p><strong>更新时间：</strong>${data.updateTime || "-"}</p>
            ${data.body ? `<p><strong>消息内容：</strong><pre style="white-space: pre-wrap; word-break: break-all;">${data.body}</pre></p>` : ""}
            ${data.exception ? `<p><strong>异常信息：</strong><pre style="white-space: pre-wrap; word-break: break-all; color: red;">${data.exception}</pre></p>` : ""}
            ${data.retryHistory ? `<p><strong>重试历史：</strong><pre style="white-space: pre-wrap; word-break: break-all;">${data.retryHistory}</pre></p>` : ""}
          </div>
        `;
        ElMessageBox.alert(detailContent, "消息重试详情", {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "关闭",
          customClass: "msg-retry-detail-dialog"
        });
      }
    } catch (error) {
      console.error("获取消息重试详情失败:", error);
      message("获取详情失败，请稍后重试", { type: "error" });
    }
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
    loadingConfig,
    adaptiveConfig,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange,
    handleViewDetail
  };
}
