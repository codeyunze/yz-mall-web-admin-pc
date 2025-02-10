import type {
  AdaptiveConfig,
  LoadingConfig,
  PaginationProps
} from "@pureadmin/table";

import { computed, onMounted, reactive, ref, type Ref } from "vue";
import { delay, getKeyList } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { deleteCart, getCartPage } from "@/api/pms";
import { usePublicHooks } from "@/views/system/hooks";
const { tagStyle } = usePublicHooks();

export { default as dayjs } from "dayjs";

export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const selectedNum = ref(0);
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "商品名称",
      prop: "productName",
      minWidth: 200
    },
    {
      label: "数量",
      prop: "quantity",
      width: 130,
      cellRenderer: ({ row }) => (
        <>
          {
            <el-input-number
              v-model={row.quantity}
              class="!w-full"
              min="1"
              max="999"
            />
          }
        </>
      )
    },
    {
      label: "价格",
      prop: "price",
      width: 130
    },
    {
      label: "商品图片",
      prop: "albumPics",
      slot: "albumPics",
      width: 200
    },
    {
      label: "商品状态",
      prop: "productStatus",
      width: 130,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={
            row.productStatus === 0 ? null : tagStyle.value(row.productStatus)
          }
        >
          {row.productStatus === 1
            ? "商品售罄"
            : row.productStatus === 2
              ? "商品下架"
              : "商品正常"}
        </el-tag>
      )
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const form = reactive({
    phone: null,
    email: null,
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
    offsetBottom: 110
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    // timeout: 60
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
  };

  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

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
    getCartPage(queryFilter).then(data => {
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

  function openDialog() {
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    message(`数据${curSelected}`, {
      type: "success"
    });
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /** 批量删除 */
  function onBatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    const ids = reactive({
      ids: getKeyList(curSelected, "id")
    });
    deleteCart(ids).then(res => {
      if (res.code === 0) {
        onSearch();
        tableRef.value.getTableRef().clearSelection();
        message(`您删除了购物车多个商品`, {
          type: "success"
        });
      }
    });
  }

  /**
   * 删除用户信息
   * @param row 用户信息
   */
  function handleDelete(row) {
    const ids = reactive({
      ids: [row.id]
    });
    deleteCart(ids).then(res => {
      if (res.code === 0) {
        onSearch();
        message(`您删除了购物车商品 [${row.productName}]`, {
          type: "success"
        });
      }
    });
  }

  function handleUpdate(row) {
    console.log(row);
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
    onSizeChange,
    onCurrentChange,
    openDialog,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange,
    onSelectionCancel,
    onBatchDel,
    handleDelete,
    handleUpdate
  };
}
