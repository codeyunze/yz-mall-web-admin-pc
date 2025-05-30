import type {
  AdaptiveConfig,
  LoadingConfig,
  PaginationProps
} from "@pureadmin/table";

import { onMounted, reactive, ref, type Ref } from "vue";
import { delay, getKeyList } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { deleteCart, getCartPage } from "@/api/pms";
import { useColumns } from "@/views/mall/order/utils/hook";
import {
  addDrawer,
  closeDrawer,
  type DrawerOptions
} from "@/components/ReDrawer/index";
import forms from "../generateOrder.vue";
import type { OrderBaseInfo, ProductInfo } from "./orderInfo";
import { type OmsOrder, omsOrderGeneral } from "@/api/oms";
const tableRef = ref();
const { openDialog } = useColumns(tableRef);
// 按钮加载状态
const btnLoading = ref(false);

export { default as dayjs } from "dayjs";

export function carUseColumns(tableRef: Ref, initLoading: boolean) {
  const loading = ref(true);
  const selectedNum = ref(0);
  const selectProductTotalPrice = ref(0);
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true, // 数据刷新后保留选项
      selectable: (row: any) => row.productStatus === 0
    },
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "商品图片",
      prop: "previewAddress",
      slot: "previewAddress",
      width: 200
    },
    {
      label: "商品名称",
      prop: "productName",
      align: "left",
      minWidth: 200,
      cellRenderer: ({ row, props }) =>
        row.productStatus === 0 ? (
          row.productName
        ) : (
          <>
            <el-tag
              size={props.size}
              type={row.productStatus === 1 ? "warning" : "danger"}
              style="margin-right: 8px"
            >
              {row.productStatus === 1 ? "售罄" : "下架"}
            </el-tag>
            {row.productName}
          </>
        )
    },
    {
      label: "价格",
      prop: "price",
      width: 150
    },
    {
      label: "数量",
      prop: "quantity",
      width: 150,
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
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const form = reactive({
    productName: null,
    startTimeFilter: null,
    endTimeFilter: null
  });
  // 列表数据
  const dataList = ref([]);
  /*const cloneData = clone(tableData, true);
  const tableDataImage = cloneData.map((item, index) =>
    Object.assign(item, {
      image: `https://pure-admin.github.io/pure-admin-table/imgs/${index + 1}.jpg`
    })
  );*/
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

  function openDialogGenerateOrder(row?: ProductInfo) {
    const curSelected =
      tableRef.value && tableRef.value.getTableRef().getSelectionRows();
    const cartItem: OrderBaseInfo = {
      products: row ? [row] : []
    };

    if (curSelected) {
      curSelected.forEach(item => {
        if (!row || item.productId != row.productId) {
          cartItem.products.push(item);
        }
      });
    }

    // 检查商品是否为空
    if (cartItem.products.length === 0) {
      message("请选择要结算的商品", { type: "warning" });
      return;
    }

    addDrawer({
      size: "60%",
      title: "生成订单",
      contentRenderer: () => forms,
      footerRenderer: ({ options, index }) => {
        return (
          <div>
            <el-button
              loading={btnLoading.value}
              onClick={() => handleCancelOrder(index)}
            >
              取消订单
            </el-button>
            <el-button
              type="primary"
              loading={btnLoading.value}
              onClick={() => handleConfirmOrder(options, index)}
            >
              确认订单
            </el-button>
          </div>
        );
      },
      props: {
        formInline: cartItem
      },
      closeCallBack: ({ options, args }) => {
        console.log(options, args);
      }
    });
  }

  // 取消订单
  function handleCancelOrder(index: number) {
    if (btnLoading.value) return;

    btnLoading.value = true;
    console.log("取消订单", index);

    // 5秒后恢复按钮状态
    setTimeout(() => {
      btnLoading.value = false;
    }, 10000);
  }

  function handleConfirmOrder(options: DrawerOptions, index: number) {
    btnLoading.value = true;
    delay(30000).then(() => {
      btnLoading.value = false;
    });

    const row = options.props.formInline;
    const params: OmsOrder = {
      orderType: 0,
      receiverName: row.receiverName ?? "",
      receiverPhone: row.receiverPhone ?? "",
      receiverProvince: row.receiverProvince ?? "",
      receiverCity: row.receiverCity ?? "",
      receiverDistrict: row.receiverDistrict ?? "",
      receiverAddress: row.receiverAddress ?? "",
      email: row.receiverEmail ?? "", // 将 receiverEmail 映射到 email
      note: "", // 如果没有备注信息，默认为空字符串或根据需求设置其他默认值
      products:
        row.products?.map(product => ({
          productId: product.productId,
          productQuantity: product.quantity
        })) ?? []
    };

    // 提交订单信息
    omsOrderGeneral(params).then(res => {
      if (res.data) {
        onSearch();
        closeDrawer(options, index);
        openDialog("订单详情", res.data.orderCode);
        btnLoading.value = false;
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
    console.log("选择项发生变化", val);
    selectProductTotalPrice.value = 0;
    if (selectedNum.value > 0) {
      val.forEach(item => {
        selectProductTotalPrice.value += item.price * item.quantity;
      });
    }
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
    onCurrentChange(val);
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
   * 删除信息
   * @param row 信息
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

  onMounted(() => {
    if (initLoading) {
      onSearch();
    }
  });

  return {
    loading,
    columns,
    form,
    dataList,
    pagination,
    selectedNum,
    selectProductTotalPrice,
    loadingConfig,
    adaptiveConfig,
    // tableDataImage,
    onSearch,
    resetForm,
    onSizeChange,
    openDialog: openDialogGenerateOrder,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange,
    onSelectionCancel,
    onBatchDel,
    handleDelete
  };
}
