import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, computed } from "vue";
import { delay } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { deleteSeries, getSeriesPage, updateSeriesStatus } from "@/api/tw";
import type { FormItemProps } from "@/views/tw/series/utils/types";
export { default as dayjs } from "dayjs";

export function useColumns() {
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "车系编码",
      prop: "seriesCode",
      width: 140
    },
    {
      label: "车系名称",
      prop: "seriesName",
      align: "left",
      minWidth: 150
    },
    {
      label: "品牌名称",
      prop: "brandName",
      align: "left",
      minWidth: 130
    },
    {
      label: "有效车型数",
      prop: "modelCount",
      width: 110
    },
    {
      label: "排序",
      prop: "sortNo",
      width: 80
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row }) => {
        const isEnabled = row.status === 1;
        return (
          <el-tag type={isEnabled ? "success" : "info"} size="small">
            {isEnabled ? "启用" : "禁用"}
          </el-tag>
        );
      }
    },
    {
      label: "创建时间",
      prop: "createTime",
      width: 180
    },
    {
      label: "操作",
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ];

  const form = reactive({
    seriesCode: null,
    seriesName: null,
    brandName: null,
    status: null
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
  });

  /** 撑满内容区自适应高度相关配置 */
  const adaptiveConfig: AdaptiveConfig = {
    offsetBottom: 110
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

    getSeriesPage(queryFilter).then(data => {
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

  function openDialog(_title = "新增", _row?: FormItemProps) {
    // TODO: 后续实现新增/编辑弹窗
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 启停状态切换 */
  function handleToggleStatus(row) {
    const newStatus = row.status === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? "启用" : "禁用";
    const data = { id: row.id, status: newStatus };
    updateSeriesStatus(data).then(res => {
      if (res.code === 200) {
        message(`车系 [${row.seriesName}] 已${statusText}`, {
          type: "success"
        });
        onSearch();
      }
    });
  }

  /** 删除车系 */
  function handleDelete(row) {
    deleteSeries(row.id).then(res => {
      if (res.code === 200) {
        onSearch();
        message(`您删除了车系 [${row.seriesName}] 的这条数据`, {
          type: "success"
        });
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
    loadingConfig,
    adaptiveConfig,
    buttonClass,
    onSearch,
    resetForm,
    onCurrentChange,
    openDialog,
    handleSizeChange,
    handleCurrentChange,
    handleToggleStatus,
    handleDelete
  };
}
