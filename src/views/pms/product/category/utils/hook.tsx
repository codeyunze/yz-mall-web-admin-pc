import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

import { ref, onMounted, reactive, h, computed } from "vue";
import { delay } from "@pureadmin/utils";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/pms/product/category/form/index.vue";
import { message } from "@/utils/message";
import {
  addCategory,
  deleteCategory,
  getCategoryPage,
  getCategoryTree,
  updateCategory
} from "@/api/pms";
import type { FormItemProps } from "@/views/pms/product/category/utils/types";
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
      label: "分类ID",
      prop: "id",
      width: 120
    },
    {
      label: "分类名称",
      prop: "categoryName",
      align: "left",
      minWidth: 150
    },
    {
      label: "分类描述",
      prop: "categoryDesc",
      minWidth: 200
    },
    {
      label: "父分类ID",
      prop: "parentId",
      width: 120,
      cellRenderer: ({ row }) => (
        <span>{row.parentId && row.parentId !== 0 ? row.parentId : "无"}</span>
      )
    },
    {
      label: "排序权重",
      prop: "sortOrder",
      width: 120
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
    id: null,
    categoryName: null,
    parentId: null
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

  // 分类树形数据（用于选择父分类）
  const categoryTreeOptions = ref([]);

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

    getCategoryPage(queryFilter).then(data => {
      dataList.value = data.data.items;
      pagination.total = Number(data.data.total);
    });
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  // 加载分类树形数据
  function loadCategoryTree() {
    getCategoryTree().then(data => {
      if (data.code === 200) {
        categoryTreeOptions.value = data.data || [];
      }
    });
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    // 加载分类树用于选择父分类
    loadCategoryTree();

    addDialog({
      title: `${title}分类信息`,
      props: {
        formInline: {
          title,
          id: row?.id ?? 0,
          parentId: row?.parentId ?? 0,
          categoryName: row?.categoryName ?? "",
          categoryDesc: row?.categoryDesc ?? "",
          sortOrder: row?.sortOrder ?? 0,
          categoryTreeOptions: categoryTreeOptions.value
        }
      },
      width: "46%",
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
          message(`您${title}了分类名称为${formData.categoryName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
          loadCategoryTree(); // 刷新分类树
        }
        FormRef.validate(valid => {
          if (!valid) {
            return;
          }

          // 清理数据，只保留后端需要的字段
          // 如果parentId为null或undefined，转换为0（表示顶级分类）
          const submitData: any = {
            parentId:
              formData.parentId == null || formData.parentId === 0
                ? 0
                : formData.parentId,
            categoryName: formData.categoryName,
            categoryDesc: formData.categoryDesc || "",
            sortOrder: formData.sortOrder || 0
          };

          // 如果是编辑，需要添加id字段
          if (title === "编辑" && formData.id) {
            submitData.id = formData.id;
          }

          // 表单规则校验通过
          if (title === "新增") {
            addCategory(submitData).then(res => {
              if (res.code === 200) {
                chores();
              }
            });
          } else {
            updateCategory(submitData).then(res => {
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
   * 删除分类信息
   * @param row 分类信息
   */
  function handleDelete(row) {
    deleteCategory(row.id).then(res => {
      if (res.code === 200) {
        onSearch();
        message(`您删除了分类名称为 [${row.categoryName}] 的这条数据`, {
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
    loadCategoryTree();
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
