import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, computed } from "vue";
import { delay } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { deleteModel, getModelPage, updateModelStatus } from "@/api/tw";
import type { FormItemProps } from "@/views/tw/model/utils/types";
export { default as dayjs } from "dayjs";

/** 能源类型映射 */
const energyTypeMap: Record<number, string> = {
  1: "纯电",
  2: "插混",
  3: "增程",
  4: "燃油"
};

export function useColumns() {
  const loading = ref(true);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "车型编码",
      prop: "modelCode",
      width: 140
    },
    {
      label: "车型名称",
      prop: "modelName",
      align: "left",
      minWidth: 150
    },
    {
      label: "所属车系",
      prop: "seriesName",
      align: "left",
      minWidth: 140
    },
    {
      label: "能源类型",
      prop: "energyType",
      width: 110,
      cellRenderer: ({ row }) => (
        <span>{energyTypeMap[row.energyType] || "-"}</span>
      )
    },
    {
      label: "座位数",
      prop: "seatCount",
      width: 100,
      cellRenderer: ({ row }) => (
        <span>{row.seatCount ? `${row.seatCount}座` : "-"}</span>
      )
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
    seriesId: null,
    seriesCode: null,
    modelCode: null,
    modelName: null,
    status: null,
    energyType: null
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

    getModelPage(queryFilter).then(data => {
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
    updateModelStatus(data).then(res => {
      if (res.code === 200) {
        message(`车型 [${row.modelName}] 已${statusText}`, {
          type: "success"
        });
        onSearch();
      }
    });
  }

  /** 删除车型 */
  function handleDelete(row) {
    deleteModel(row.id).then(res => {
      if (res.code === 200) {
        onSearch();
        message(`您删除了车型 [${row.modelName}] 的这条数据`, {
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
