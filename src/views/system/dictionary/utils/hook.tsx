import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import {
  addDictionary,
  deleteDictionaryById,
  getAllDictionaryList,
  getDictionaryById,
  getDictionaryPage,
  updateDictionaryById
} from "@/api/system";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h, type Ref } from "vue";
import type { FormItemProps } from "./types";
import { cloneDeep, deviceDetection, debounce } from "@pureadmin/utils";
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
    invalid: null,
    startTimeFilter: null,
    endTimeFilter: null
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
      label: "序号",
      type: "index",
      width: 90
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
      label: "排序",
      prop: "sortOrder",
      width: 100
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
    form.invalid = null;
    form.startTimeFilter = null;
    form.endTimeFilter = null;
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
        invalid: form.invalid || null,
        startTimeFilter: form.startTimeFilter || null,
        endTimeFilter: form.endTimeFilter || null
      }
    };

    try {
      const { data } = await getDictionaryPage(queryFilter);
      if (data?.items) {
        // 为第一层级数据添加 hasChildren 属性，用于显示展开图标
        dataList.value = data.items.map(item => ({
          ...item,
          hasChildren: true // 假设第一层级都有子项，实际可以根据业务判断
        }));
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

  /**
   * 懒加载子节点数据（支持无限层级）
   * @param row 当前行数据
   * @param treeNode 树节点
   * @param resolve 回调函数，用于返回子节点数据
   */
  async function loadChildren(
    row: FormItemProps & { hasChildren?: boolean },
    treeNode: unknown,
    resolve: (data: FormItemProps[]) => void
  ) {
    try {
      const queryFilter = {
        filter: {
          parentId: row.id // 子节点数据，parentId为父节点的id
        }
      };
      const { data } = await getDictionaryPage(queryFilter);
      if (data?.items && data.items.length > 0) {
        // 为每个子节点都设置 hasChildren: true，支持继续展开下一层级
        // 当用户点击展开时，如果没有子节点，会在下一次 loadChildren 调用时返回空数组并更新 hasChildren
        const children = data.items.map(item => ({
          ...item,
          hasChildren: true // 支持无限层级，每个节点都假设可能有子节点
        }));
        resolve(children);
      } else {
        // 如果没有子节点，更新当前行的 hasChildren 为 false
        if (row.hasChildren !== undefined) {
          row.hasChildren = false;
        }
        resolve([]);
      }
    } catch (error) {
      console.error("加载子节点失败:", error);
      // 加载失败时也更新 hasChildren
      if (row.hasChildren !== undefined) {
        row.hasChildren = false;
      }
      resolve([]);
    }
  }

  function formatHigherDictionaryOptions(
    treeList: Array<Record<string, unknown>>
  ): Array<Record<string, unknown>> {
    if (!treeList || !treeList.length) return [];
    const newTreeList: Array<Record<string, unknown>> = [];
    for (let i = 0; i < treeList.length; i++) {
      const item: Record<string, unknown> = {
        ...treeList[i],
        label: treeList[i].dictionaryValue,
        value: treeList[i].id
      };
      if (treeList[i].children) {
        item.children = formatHigherDictionaryOptions(
          treeList[i].children as Array<Record<string, unknown>>
        );
      }
      newTreeList.push(item);
    }
    return newTreeList;
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
          onSearch(); // 刷新表格数据
        } else {
          message(res.msg, {
            type: "error"
          });
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
          onSearch(); // 刷新表格数据
        } else {
          message(res.msg, { type: "error" });
        }
      });
    },
    3000,
    true
  );

  function openDialog(title = "新增", row?: Partial<FormItemProps>) {
    // 如果是修改操作，只调用 getDictionaryById 获取数据，不请求 list 接口
    if (title === "修改" && row?.id) {
      getDictionaryById(row.id).then(dictRes => {
        if (dictRes.code === 0 && dictRes.data) {
          // 使用从接口获取的最新数据
          let dictData = dictRes.data;
          // 检查返回数据是否为数组，如果是数组则取第一个元素
          if (Array.isArray(dictData)) {
            dictData = dictData[0];
          }
          // 修改操作不需要上级字典选项，传空数组
          openDialogWithData(dictData as Partial<FormItemProps>, [], title);
        } else {
          message("获取字典数据失败", { type: "error" });
        }
      });
    } else {
      // 新增操作，获取所有字典列表用于上级字典选择
      getAllDictionaryList({}).then(res => {
        let higherOptions = [];
        if (res.code === 0 && res.data) {
          const hasParentId = res.data.some(
            item => item.parentId && item.parentId !== "0"
          );
          if (hasParentId) {
            const treeData = handleTree(res.data);
            higherOptions = formatHigherDictionaryOptions(cloneDeep(treeData));
          } else {
            higherOptions = res.data.map(item => ({
              ...item,
              label: item.dictionaryValue,
              value: item.id
            }));
          }
        }
        // 新增操作，直接使用传入的row数据
        openDialogWithData(row, higherOptions, title);
      });
    }
  }

  /** 打开对话框的公共函数 */
  function openDialogWithData(
    row?: Partial<FormItemProps>,
    higherOptions = [],
    title = "新增"
  ) {
    addDialog({
      title: `${title}字典`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          ancestorId: row?.ancestorId ?? "0",
          parentId: row?.parentId ?? "0",
          dictionaryKey: row?.dictionaryKey ?? "",
          dictionaryValue: row?.dictionaryValue ?? "",
          sortOrder: row?.sortOrder ?? 0,
          invalid: row?.invalid ?? "0",
          higherDictionaryOptions: higherOptions
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
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            // 处理 parentId，如果为空或未选择，设置为 "0"
            const submitData = {
              ...curData,
              parentId:
                curData.parentId && curData.parentId !== ""
                  ? curData.parentId
                  : "0",
              ancestorId:
                curData.ancestorId && curData.ancestorId !== ""
                  ? curData.ancestorId
                  : "0"
            };
            dictionaryParam.value = submitData;
            if (title === "新增") {
              (
                debounceHandleAddDictionary as (
                  operation: string,
                  dictionaryValue: string,
                  done: () => void
                ) => void
              )(title, curData.dictionaryValue, done as () => void);
            } else {
              (
                debounceHandleUpdateDictionary as (
                  operation: string,
                  dictionaryValue: string,
                  done: () => void
                ) => void
              )(title, curData.dictionaryValue, done as () => void);
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
    onBatchDel,
    loadChildren
  };
}
