import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { getLoginLogPage, clearLoginLog } from "@/api/system";
import { ref, onMounted, reactive } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";

export { default as dayjs } from "dayjs";

export function useLoginLog() {
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "用户名",
      prop: "username",
      width: 200
    },
    {
      label: "登录IP",
      prop: "loginIp",
      minWidth: 150
    },
    {
      label: "登录地点",
      prop: "loginLocation",
      minWidth: 150
    },
    {
      label: "操作系统",
      prop: "os",
      minWidth: 150
    },
    {
      label: "浏览器",
      prop: "browser",
      minWidth: 150
    },
    {
      label: "登录状态",
      prop: "status",
      width: 120,
      cellRenderer: ({ row }) => {
        return row.status === 1 ? (
          <el-tag type="primary">成功</el-tag>
        ) : (
          <el-tag type="danger">失败</el-tag>
        );
      }
    },
    {
      label: "登录时间",
      prop: "loginTime",
      width: 180
    },
    {
      label: "创建时间",
      prop: "createTime",
      width: 180
    }
  ];

  const form = reactive({
    username: null,
    status: null,
    startTime: null,
    endTime: null
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
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: {
        username: form.username || "",
        status: form.status !== null ? String(form.status) : "",
        startTime: form.startTime || "",
        endTime: form.endTime || ""
      }
    };

    try {
      const { data } = await getLoginLogPage(queryFilter);
      if (data?.items) {
        dataList.value = data.items;
        pagination.total = Number(data.total || 0);
      } else {
        dataList.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error("查询登录日志列表失败:", error);
      dataList.value = [];
      pagination.total = 0;
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  }

  const resetForm = () => {
    form.username = null;
    form.status = null;
    form.startTime = null;
    form.endTime = null;
    pagination.currentPage = 1;
    onSearch();
  };

  /**
   * 清空日志
   */
  async function handleClearLog() {
    try {
      await ElMessageBox.confirm(
        "此操作将清空所有登录日志，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );

      const res = await clearLoginLog();
      if (res.code === 200) {
        message("清空日志成功", { type: "success" });
        onSearch();
      } else {
        message(res.msg || "清空日志失败", { type: "error" });
      }
    } catch (error: any) {
      if (error !== "cancel") {
        console.error("清空日志失败:", error);
        message("清空日志失败，请稍后重试", { type: "error" });
      }
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
    handleClearLog
  };
}
