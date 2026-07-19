import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, h, computed, type Ref } from "vue";
import { delay, deviceDetection } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/pms/stock/info/form/index.vue";
import skuStockDialog from "@/views/pms/stock/info/skuStockDialog.vue";
import { message } from "@/utils/message";
import {
  deleteProduct,
  getSkuStockByProductId,
  getStockPage,
  pmsProductStockIn,
  pmsProductStockOut
} from "@/api/pms";
import type { FormItemProps } from "@/views/pms/stock/info/utils/types";
export { default as dayjs } from "dayjs";

export function useColumns(tableRef: Ref) {
  const loading = ref(true);
  const selectedNum = ref(0);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "商品",
      prop: "productName",
      align: "left"
    },
    {
      label: "标签",
      prop: "titles",
      minWidth: 200
    },
    {
      label: "售价（元）",
      prop: "productPrice",
      width: 200
    },
    {
      label: "库存数量",
      prop: "quantity",
      width: 200,
      cellRenderer: ({ row }) => (
        <el-button link type="primary" onClick={() => openSkuStockDialog(row)}>
          {row.quantity ?? 0}
        </el-button>
      )
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const formRef = ref();
  const form = reactive({
    productName: "",
    skuId: 0,
    quantity: 0,
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
    offsetBottom: 110,
    /** 是否固定表头，默认值为 `true`（如果不想固定表头，fixHeader设置为false并且表格要设置table-layout="auto"） */
    // fixHeader: true
    /** 页面 `resize` 时的防抖时间，默认值为 `60` ms */
    timeout: 200
    /** 表头的 `z-index`，默认值为 `100` */
    // zIndex: 100
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

    getStockPage(queryFilter).then(data => {
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
   * 点击汇总库存：弹窗展示该商品各 SKU 库存
   */
  function openSkuStockDialog(row) {
    if (!row?.productId) {
      message("商品信息不完整，无法查询SKU库存", { type: "warning" });
      return;
    }
    getSkuStockByProductId(row.productId).then(res => {
      if (res.code !== 200) {
        message(res.msg || "查询SKU库存失败", { type: "error" });
        return;
      }
      const list = Array.isArray(res.data) ? res.data : [];
      addDialog({
        title: `${row.productName || "商品"} - SKU库存明细`,
        width: "640px",
        style: {
          "border-radius": "12px"
        },
        draggable: true,
        hideFooter: true,
        closeOnClickModal: true,
        contentRenderer: () => h(skuStockDialog, { list })
      });
    });
  }

  function openDialog(title = "入库", row?: FormItemProps) {
    addDialog({
      title: `${row.productName} 商品${title}`,
      props: {
        formInline: {
          productId: row.productId,
          productName: row.productName,
          skuId: row.skuId,
          quantity: 0,
          remark: ""
        }
      },
      width: "46%",
      style: {
        "border-radius": "12px"
      },
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: done => {
        const FormRef = formRef.value.getRef();
        // 从表单组件中获取实际的数据，而不是使用初始的 props
        const formData = formRef.value.getFormData();
        function chores() {
          message(
            `商品 [${row.productName}] 成功${title}数量 ${formData.quantity}`,
            {
              type: "success"
            }
          );
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (!valid) {
            return;
          }
          // 清理数据，只保留后端需要的字段
          const submitData: any = {
            productId: formData.productId,
            skuId: formData.skuId,
            quantity: formData.quantity,
            remark: formData.remark || ""
          };
          if (title === "入库") {
            pmsProductStockIn(submitData).then(res => {
              if (res.code === 200) {
                chores();
              }
            });
          } else {
            pmsProductStockOut(submitData).then(res => {
              if (res.code === 200) {
                chores();
              }
            });
          }
        });
      }
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

  /**
   * 设置一页数据量
   * @param val 一页展示的数据量
   */
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  /**
   * 翻页
   * @param val 页码
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /**
   * 删除商品信息
   * @param row 商品信息
   */
  function handleDelete(row) {
    deleteProduct(row.id).then(res => {
      if (res.code === 200) {
        onSearch();
        message(`您删除了商品名称为 [${row.productName}] 的这条数据`, {
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
    onCurrentChange,
    openDialog,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange,
    onSelectionCancel,
    handleDelete,
    handleUpdate
  };
}
