import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, h, computed } from "vue";
import { delay, deviceDetection } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "../form/index.vue";
import type { FormItemProps } from "./types";
import { message } from "@/utils/message";
import {
  pageReceiptInfo,
  addReceiptInfo,
  updateReceiptInfo,
  deleteReceiptInfo
} from "@/api/system";
export { default as dayjs } from "dayjs";

export function useColumns() {
  const loading = ref(true);
  const selectedNum = ref(0);
  const higherDeptOptions = ref();
  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "收货人",
      prop: "receiverName",
      minWidth: 130
    },
    {
      label: "收货手机号",
      prop: "receiverPhone"
    },
    {
      label: "通知邮件",
      prop: "receiverEmail"
    },
    {
      label: "收货地址(省)",
      prop: "receiverProvince"
    },
    {
      label: "收货地址(市)",
      prop: "receiverCity"
    },
    {
      label: "收货地址(区/县)",
      prop: "receiverDistrict"
    },
    {
      label: "收货详细地址",
      prop: "receiverAddress"
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const form = reactive({
    receiverProvince: null,
    receiverCity: null,
    receiverDistrict: null,
    receiverAddress: null,
    receiverName: null,
    receiverPhone: null,
    receiverEmail: null
  });
  const formRef = ref();
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

    pageReceiptInfo(queryFilter).then(data => {
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

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}收货地址信息`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          id: row?.id ?? 0,
          receiverName: row?.receiverName ?? "",
          receiverPhone: row?.receiverPhone ?? "",
          receiverEmail: row?.receiverEmail ?? "",
          receiverProvince: row?.receiverProvince ?? "",
          receiverCity: row?.receiverCity ?? "",
          receiverDistrict: row?.receiverDistrict ?? "",
          receiverAddress: row?.receiverAddress ?? ""
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
        console.log(curData);
        function chores() {
          message(`您${title}一条收货信息`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (!valid) {
            return;
          }
          // 表单规则校验通过
          if (title === "新增") {
            // 实际开发先调用新增接口，再进行下面操作
            addReceiptInfo(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          } else {
            // 实际开发先调用修改接口，再进行下面操作
            updateReceiptInfo(curData).then(res => {
              if (res.code === 0) {
                chores();
              }
            });
          }
        });
      }
    });
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /**
   * 删除收货地址信息
   * @param row 收货地址信息
   */
  function handleDelete(row) {
    deleteReceiptInfo(row.id).then(res => {
      if (res.code === 0) {
        onSearch();
        message(
          `您删除了 [${row.receiverName}]-[${row.receiverPhone}] 的这条收货地址信息`,
          {
            type: "success"
          }
        );
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
    handleSizeChange,
    handleCurrentChange,
    handleDelete,
    handleUpdate
  };
}
