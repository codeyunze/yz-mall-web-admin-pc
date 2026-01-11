import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, h, computed } from "vue";
import { delay } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/pms/product/sku/form/index.vue";
import { message } from "@/utils/message";
import {
  addSku,
  deleteSku,
  getSkuPage,
  updateSku,
  getProductPage
} from "@/api/pms";
// @ts-ignore
import type { FormItemProps } from "@/views/pms/product/sku/utils/types";
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
      label: "SKU ID",
      prop: "id",
      width: 120
    },
    {
      label: "商品ID",
      prop: "productId",
      width: 120
    },
    {
      label: "SKU编码",
      prop: "skuCode",
      align: "left",
      minWidth: 150
    },
    {
      label: "SKU名称",
      prop: "skuName",
      align: "left",
      minWidth: 150
    },
    {
      label: "售价（元）",
      prop: "priceFee",
      width: 120,
      cellRenderer: ({ row }) => (
        <span>¥{((row.priceFee || 0) / 100).toFixed(2)}</span>
      )
    },
    {
      label: "市场价（元）",
      prop: "marketPriceFee",
      width: 120,
      cellRenderer: ({ row }) => (
        <span>¥{((row.marketPriceFee || 0) / 100).toFixed(2)}</span>
      )
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={
            row.status === 1
              ? "success"
              : row.status === 0
                ? "warning"
                : "danger"
          }
        >
          {row.status === 1 ? "启用" : row.status === 0 ? "禁用" : "删除"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      prop: "createTime",
      width: 200
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
    productId: null,
    skuCode: null
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
    /** 表格距离页面底部的偏移量，默认值为 `96` */
    offsetBottom: 110
  };

  // 商品列表（用于选择商品）
  const productOptions = ref([]);

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

    getSkuPage(queryFilter).then(data => {
      dataList.value = data.data.items;
      pagination.total = Number(data.data.total);
    });
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  // 加载商品列表
  function loadProductList() {
    getProductPage({
      size: 1000,
      current: 1,
      filter: {}
    }).then(data => {
      if (data.code === 200) {
        productOptions.value = (data.data.items || []).map(item => ({
          label: item.productName,
          value: item.id
        }));
      }
    });
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    // 加载商品列表用于选择商品
    loadProductList();

    addDialog({
      title: `${title}商品SKU`,
      props: {
        formInline: {
          title,
          id: row?.id ?? 0,
          productId: row?.productId ?? null,
          skuCode: row?.skuCode ?? "",
          skuName: row?.skuName ?? "",
          priceFee: row?.priceFee ?? 0,
          marketPriceFee: row?.marketPriceFee ?? 0,
          status: row?.status ?? 1,
          albumPics: row?.albumPics ?? "",
          productOptions: productOptions.value
        }
      },
      width: "60%",
      style: {
        "border-radius": "12px"
      },
      draggable: false,
      fullscreen: false,
      fullscreenIcon: true,
      closeOnClickModal: false,
      hideFooter: title !== "编辑" && title !== "新增",
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: done => {
        const FormRef = formRef.value.getRef();
        // 从表单组件中获取实际的数据，而不是使用初始的 props
        const formData = formRef.value.getFormData();
        function chores() {
          message(`您${title}了SKU编码为${formData.skuCode}的这条数据`, {
            type: "success"
          });
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
            skuCode: formData.skuCode,
            skuName: formData.skuName,
            priceFee: formData.priceFee,
            marketPriceFee: formData.marketPriceFee,
            status: formData.status ?? 1,
            albumPics: formData.albumPics || ""
          };

          // 如果是编辑，需要添加id字段
          if (title === "编辑" && formData.id) {
            submitData.id = formData.id;
          }

          // 表单规则校验通过
          if (title === "新增") {
            addSku(submitData).then(res => {
              if (res.code === 200) {
                const skuId = res.data;
                // 如果有待添加的属性，保存SKU后添加属性
                if (formRef.value.saveAttrs) {
                  formRef.value.saveAttrs(skuId).then(() => {
                    chores();
                  });
                } else {
                  chores();
                }
              }
            });
          } else {
            updateSku(submitData).then(res => {
              if (res.code === 200) {
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

  /**
   * 删除SKU信息
   * @param row SKU信息
   */
  function handleDelete(row) {
    deleteSku(row.id).then(res => {
      if (res.code === 200) {
        onSearch();
        message(`您删除了SKU编码为 [${row.skuCode}] 的这条数据`, {
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
    loadProductList();
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
    handleDelete,
    handleUpdate
  };
}
