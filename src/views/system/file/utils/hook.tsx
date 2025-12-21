import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { getFilePage, deleteFileById } from "@/api/system";
import { baseUrlApi } from "@/api/utils";
import { ref, onMounted, reactive, h, type Ref } from "vue";
import { message } from "@/utils/message";
import { downloadByData, deviceDetection } from "@pureadmin/utils";
import { getToken, formatToken } from "@/utils/auth";
import { addDialog } from "@/components/ReDialog";
import axios from "axios";
import Preview from "../components/Preview.vue";
import type { FormItemProps } from "./types";

export { default as dayjs } from "dayjs";

export function useFile(tableRef: Ref) {
  const loading = ref(true);
  const selectedNum = ref(0);
  const columns: TableColumnList = [
    {
      label: "勾选列",
      type: "selection",
      fixed: "left",
      reserveSelection: true
    },
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "文件id",
      prop: "id",
      width: 250
    },
    {
      label: "文件名",
      prop: "fileName",
      align: "left",
      minWidth: 200
    },
    {
      label: "文件类型",
      prop: "fileType",
      width: 120
    },
    {
      label: "文件大小",
      prop: "fileSize",
      width: 120,
      cellRenderer: ({ row }) => {
        const size = Number(row.fileSize);
        if (size < 1024) {
          return `${size} B`;
        } else if (size < 1024 * 1024) {
          return `${(size / 1024).toFixed(2)} KB`;
        } else if (size < 1024 * 1024 * 1024) {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else {
          return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }
      }
    },
    {
      label: "存储模式",
      prop: "fileStorageMode",
      width: 120
    },
    {
      label: "存储站",
      prop: "fileStorageStation",
      width: 120
    },
    {
      label: "创建时间",
      prop: "createTime",
      width: 180
    },
    {
      label: "更新时间",
      prop: "updateTime",
      width: 180
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const form = reactive({
    fileName: null,
    fileType: null,
    fileStorageStation: null,
    fileStorageMode: null,
    createTimeFrom: null,
    createTimeTo: null
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

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    if (tableRef?.value) {
      tableRef.value.getTableRef().clearSelection();
    }
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val: unknown[]) {
    selectedNum.value = val.length;
    if (tableRef?.value) {
      tableRef.value.setAdaptive();
    }
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

  async function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: {
        fileName: form.fileName || null,
        fileType: form.fileType || null,
        fileStorageStation: form.fileStorageStation || null,
        fileStorageMode: form.fileStorageMode || null,
        createTimeFrom: form.createTimeFrom || null,
        createTimeTo: form.createTimeTo || null
      }
    };

    try {
      const { data } = await getFilePage(queryFilter);
      if (data?.items) {
        dataList.value = data.items;
        pagination.total = Number(data.total || 0);
      } else {
        dataList.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error("查询文件列表失败:", error);
      dataList.value = [];
      pagination.total = 0;
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  }

  const resetForm = () => {
    form.fileName = null;
    form.fileType = null;
    form.fileStorageStation = null;
    form.fileStorageMode = null;
    form.createTimeFrom = null;
    form.createTimeTo = null;
    pagination.currentPage = 1;
    onSearch();
  };

  /**
   * 预览文件
   * @param row 文件信息
   */
  function handlePreview(row: FormItemProps) {
    addDialog({
      title: `预览文件 - ${row.fileName}`,
      width: "80%",
      style: {
        "border-radius": "12px"
      },
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(Preview, {
          fileId: row.id,
          fileName: row.fileName,
          fileType: row.fileType
        })
    });
  }

  /**
   * 下载文件
   * @param row 文件信息
   */
  function handleDownload(row: FormItemProps) {
    // 使用 axios 直接请求文件，设置 responseType 为 blob
    const token = getToken();
    axios
      .get(baseUrlApi(`/sys/file/download/${row.id}`), {
        responseType: "blob",
        headers: {
          Authorization: token ? formatToken(token.accessToken) : ""
        }
      })
      .then(({ data }) => {
        downloadByData(data, row.fileName);
        message(`文件 [${row.fileName}] 下载成功`, {
          type: "success"
        });
      })
      .catch(error => {
        console.error("下载文件失败:", error);
        message(`文件 [${row.fileName}] 下载失败`, {
          type: "error"
        });
      });
  }

  /**
   * 删除文件
   * @param row 文件信息
   */
  function handleDelete(row: FormItemProps) {
    deleteFileById(row.id).then(res => {
      if (res.code === 200) {
        message(`您删除了文件名为 [${row.fileName}] 的这条数据`, {
          type: "success"
        });
        onSearch();
      } else {
        message(`删除文件名为 [${row.fileName}] 的数据失败`, {
          type: "error"
        });
      }
    });
  }

  /** 批量删除 */
  function onBatchDel() {
    if (!tableRef?.value) return;
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    if (curSelected.length === 0) {
      message("请先选择要删除的数据", { type: "warning" });
      return;
    }
    // 批量删除逻辑
    Promise.all(curSelected.map(item => deleteFileById(item.id))).then(
      results => {
        const successCount = results.filter(res => res.code === 200).length;
        if (successCount === curSelected.length) {
          message(`已删除 ${successCount} 条数据`, {
            type: "success"
          });
          tableRef.value.getTableRef().clearSelection();
          onSearch();
        } else {
          message(
            `删除完成，成功 ${successCount} 条，失败 ${curSelected.length - successCount} 条`,
            {
              type: "warning"
            }
          );
          onSearch();
        }
      }
    );
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
    onSearch,
    resetForm,
    handlePreview,
    handleDownload,
    handleDelete,
    handleSelectionChange,
    onSelectionCancel,
    handleSizeChange,
    handleCurrentChange,
    onBatchDel
  };
}
