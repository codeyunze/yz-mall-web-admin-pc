import type { LoadingConfig, PaginationProps } from "@pureadmin/table";

import { ref, onMounted, reactive, h } from "vue";
import { deviceDetection } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/pms/stock/info/form/index.vue";
import { message } from "@/utils/message";
import {
  pmsStockInPage,
  pmsProductStockIn,
  pmsProductStockOut
} from "@/api/pms";
import type { FormItemProps } from "@/views/pms/stock/info/utils/viewTypes";
export { default as dayjs } from "dayjs";

export function useColumns() {
  const loading = ref(true);
  const selectedNum = ref(0);
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "入库编号",
      prop: "stockInCode"
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
      label: "供应商名称",
      prop: "supplierName",
      align: "left"
    },
    {
      label: "入库数量",
      prop: "quantity"
    },
    {
      label: "入库时间",
      prop: "createTime"
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
    productId: 0,
    quantity: 0,
    startTimeFilter: null,
    endTimeFilter: null
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

  function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: form
    };

    pmsStockInPage(queryFilter).then(data => {
      dataList.value = data.data.items;
      pagination.total = Number(data.data.total);
    });
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function openDialog(title = "入库", row?: FormItemProps) {
    addDialog({
      title: `${row.productName} 商品${title}`,
      props: {
        formInline: {
          productName: row.productName,
          productId: row.productId,
          quantity: 0,
          remark: row.remark
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
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(
            `商品 [${row.productName}] 成功${title}数量 ${curData.quantity}`,
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
          if (title === "入库") {
            pmsProductStockIn(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          } else {
            pmsProductStockOut(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          }
        });
      }
    });
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
    openDialog,
    handleSizeChange,
    handleCurrentChange
  };
}
