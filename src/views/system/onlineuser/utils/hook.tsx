import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { getOnlineUserList, kickoutOnlineUser } from "@/api/system";
import { ref, onMounted, reactive } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";

export function useOnlineUser() {
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "用户ID",
      prop: "userId",
      width: 200
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
      label: "登录时间",
      prop: "loginTime",
      width: 180
    },
    {
      label: "操作",
      fixed: "right",
      width: 120,
      slot: "operation"
    }
  ];

  const form = reactive({
    username: null
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
        username: form.username || ""
      }
    };

    try {
      const { data } = await getOnlineUserList(queryFilter);
      if (data?.items) {
        dataList.value = data.items;
        pagination.total = Number(data.total || 0);
      } else {
        dataList.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error("查询在线用户列表失败:", error);
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
    pagination.currentPage = 1;
    onSearch();
  };

  /**
   * 踢下线
   */
  async function handleKickout(userId: string | number) {
    try {
      await ElMessageBox.confirm(`确定要将用户 ${userId} 踢下线吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });

      const res = await kickoutOnlineUser(userId);
      if (res.code === 200) {
        message("踢下线成功", { type: "success" });
        onSearch();
      } else {
        message(res.msg || "踢下线失败", { type: "error" });
      }
    } catch (error: any) {
      if (error !== "cancel") {
        console.error("踢下线失败:", error);
        message("踢下线失败，请稍后重试", { type: "error" });
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
    handleKickout
  };
}
