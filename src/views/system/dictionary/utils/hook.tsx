import editForm from "../form.vue";
import { message } from "@/utils/message";
import {
  addDictionary,
  deleteDictionaryById,
  getDictionaryById,
  getDictionaryPage,
  updateDictionaryById
} from "@/api/system";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, type Ref } from "vue";
import type { FormItemProps } from "./types";
import { deviceDetection, debounce } from "@pureadmin/utils";
import type {
  LoadingConfig,
  AdaptiveConfig,
  PaginationProps
} from "@pureadmin/table";

export { default as dayjs } from "dayjs";

export function useDictionary(tableRef: Ref) {
  const form = reactive({
    dictionaryKey: null,
    dictionaryValue: null,
    dictionaryEnable: null,
    createTimeFrom: null,
    createTimeTo: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const selectedNum = ref(0);

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

  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "字典键",
      prop: "dictionaryKey",
      align: "left",
      minWidth: 150
    },
    {
      label: "字典值",
      prop: "dictionaryValue",
      align: "left",
      minWidth: 150
    },
    {
      label: "状态",
      prop: "dictionaryEnable",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={row.dictionaryEnable === 0 ? "primary" : "danger"}>
          {row.dictionaryEnable === 0 ? "启用" : "禁用"}
        </el-tag>
      )
    },
    {
      label: "排序",
      prop: "sortOrder",
      minWidth: 80
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

  function handleSelectionChange(val: unknown[]) {
    selectedNum.value = val.length;
    if (tableRef?.value) {
      tableRef.value.setAdaptive();
    }
  }

  function resetForm(formEl: { resetFields: () => void } | null) {
    if (!formEl) return;
    formEl.resetFields();
    form.dictionaryKey = null;
    form.dictionaryValue = null;
    form.dictionaryEnable = null;
    form.createTimeFrom = null;
    form.createTimeTo = null;
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: {
        parentId: "0", // 第一层级数据，parentId为0
        dictionaryKey: form.dictionaryKey || null,
        dictionaryValue: form.dictionaryValue || null,
        dictionaryEnable: form.dictionaryEnable || null,
        createTimeFrom: form.createTimeFrom || null,
        createTimeTo: form.createTimeTo || null
      }
    };

    try {
      const { data } = await getDictionaryPage(queryFilter);
      if (data?.items) {
        // 接口返回的数据已经是树形结构，children属性下就是子节点
        // 处理children为null的情况，转换为undefined（Element Plus需要undefined而不是null）
        const processTree = (
          items: (FormItemProps & { children?: FormItemProps[] | null })[]
        ): FormItemProps[] => {
          return items.map(item => {
            const processedItem: FormItemProps = { ...item };
            if (
              item.children &&
              Array.isArray(item.children) &&
              item.children.length > 0
            ) {
              processedItem.children = processTree(item.children);
            } else {
              // children为null或空数组时，设置为undefined，Element Plus会自动判断是否显示展开图标
              processedItem.children = undefined;
            }
            return processedItem;
          });
        };
        dataList.value = processTree(
          data.items as (FormItemProps & {
            children?: FormItemProps[] | null;
          })[]
        );
        pagination.total = Number(data.total || 0);
      } else {
        dataList.value = [];
        pagination.total = 0;
      }
    } catch (error) {
      console.error("查询字典列表失败:", error);
      dataList.value = [];
      pagination.total = 0;
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  }

  const dictionaryParam = ref({});

  /**
   * 处理新增字典操作
   */
  const debounceHandleAddDictionary = debounce(
    (operation: string, dictionaryValue: string, done: () => void) => {
      addDictionary(dictionaryParam.value).then(res => {
        if (res.code === 0) {
          message(`您${operation}了字典值为 [${dictionaryValue}] 的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据，参考菜单管理的实现
        }
      });
    },
    3000,
    true
  );

  /**
   * 处理修改字典操作
   */
  const debounceHandleUpdateDictionary = debounce(
    (operation: string, dictionaryValue: string, done: () => void) => {
      updateDictionaryById(dictionaryParam.value).then(res => {
        if (res.code === 0) {
          message(`您${operation}了字典值为 [${dictionaryValue}] 的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据，参考菜单管理的实现
        }
      });
    },
    3000,
    true
  );

  function openDialog(title = "新增", row?: Partial<FormItemProps>) {
    // 修改：仅调用 getDictionaryById 获取数据，不再请求 list
    if (title === "修改" && row?.id) {
      getDictionaryById(row.id).then(dictRes => {
        if (dictRes.code === 0 && dictRes.data) {
          let dictData = dictRes.data;
          if (Array.isArray(dictData)) {
            dictData = dictData[0];
          }
          openDialogWithData(
            dictData as Partial<FormItemProps>,
            title,
            row as FormItemProps
          );
        } else {
          message("获取字典数据失败", { type: "error" });
        }
      });
    } else {
      // 新增：直接使用传入的 parentId 或默认 0
      openDialogWithData(
        {
          id: 0,
          ancestorId: "0",
          parentId: row?.id ?? "0",
          dictionaryKey: "",
          dictionaryValue: "",
          sortOrder: 0,
          dictionaryEnable: "0"
        },
        title,
        row as FormItemProps
      );
    }
  }

  /** 打开对话框的公共函数 */
  function openDialogWithData(
    row?: Partial<FormItemProps>,
    title = "新增",
    contextRow?: FormItemProps
  ) {
    const computedParentId =
      title === "新增" && contextRow?.id
        ? contextRow.id
        : (row?.parentId ?? "0");

    addDialog({
      title: `${title}字典`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          ancestorId: row?.ancestorId ?? "0",
          parentId: computedParentId,
          dictionaryKey: row?.dictionaryKey ?? "",
          dictionaryValue: row?.dictionaryValue ?? "",
          sortOrder: row?.sortOrder ?? 0,
          dictionaryEnable:
            row?.dictionaryEnable !== undefined &&
            row?.dictionaryEnable !== null
              ? String(row.dictionaryEnable)
              : 0,
          higherDictionaryOptions: []
        }
      },
      width: "45%",
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
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            // 处理 parentId，如果为空或未选择，设置为 "0"
            const submitData = {
              ...formData,
              parentId:
                formData.parentId && formData.parentId !== ""
                  ? formData.parentId
                  : "0",
              ancestorId:
                formData.ancestorId && formData.ancestorId !== ""
                  ? formData.ancestorId
                  : "0",
              // 确保 dictionaryEnable 是字符串类型
              dictionaryEnable:
                formData.dictionaryEnable !== undefined &&
                formData.dictionaryEnable !== null
                  ? String(formData.dictionaryEnable)
                  : 0
            };
            dictionaryParam.value = submitData;
            if (title === "新增") {
              // 参考菜单管理的实现，刷新逻辑在防抖函数内部处理
              (
                debounceHandleAddDictionary as (
                  operation: string,
                  dictionaryValue: string,
                  done: () => void,
                  parentId?: string | number
                ) => void
              )(
                title,
                formData.dictionaryValue,
                done as () => void,
                submitData.parentId
              );
            } else {
              // 参考菜单管理的实现，刷新逻辑在防抖函数内部处理
              (
                debounceHandleUpdateDictionary as (
                  operation: string,
                  dictionaryValue: string,
                  done: () => void,
                  parentId?: string | number
                ) => void
              )(
                title,
                formData.dictionaryValue,
                done as () => void,
                submitData.parentId
              );
            }
          }
        });
      }
    });
  }

  function handleDelete(row: FormItemProps) {
    deleteDictionaryById(row.id as unknown as object).then(res => {
      if (res.code === 0) {
        message(`您删除了字典值为${row.dictionaryValue}的这条数据`, {
          type: "success"
        });
        onSearch();
      } else {
        message(`删除字典值为${row.dictionaryValue}的数据失败`, {
          type: "error"
        });
      }
    });
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    if (tableRef?.value) {
      tableRef.value.getTableRef().clearSelection();
    }
  }

  /**
   * 设置一页数据量
   */
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  /**
   * 翻页
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
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
    Promise.all(curSelected.map(item => deleteDictionaryById(item.id))).then(
      results => {
        const successCount = results.filter(res => res.code === 0).length;
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
    form,
    loading,
    columns,
    dataList,
    pagination,
    selectedNum,
    loadingConfig,
    adaptiveConfig,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSelectionChange,
    onSelectionCancel,
    handleSizeChange,
    handleCurrentChange,
    onBatchDel
  };
}
