import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
// getMenuList,
import {
  addMenu,
  deleteMenuById,
  getAllMenuList,
  updateMenuById
} from "@/api/system";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "../utils/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  cloneDeep,
  isAllEmpty,
  deviceDetection,
  debounce
} from "@pureadmin/utils";

export function useMenu() {
  const form = reactive({
    title: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const getMenuType = (type, text = false) => {
    switch (type) {
      case 0:
        return text ? "菜单" : "primary";
      case 1:
        return text ? "iframe" : "warning";
      case 2:
        return text ? "外链" : "danger";
      case 3:
        return text ? "按钮" : "info";
      case 4:
        return text ? "接口" : "warning";
    }
  };

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "title",
      align: "left",
      minWidth: 120,
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{transformI18n(row.title)}</span>
        </>
      )
    },
    {
      label: "菜单类型",
      prop: "menuType",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={getMenuType(row.menuType)}
          effect="plain"
        >
          {getMenuType(row.menuType, true)}
        </el-tag>
      )
    },
    {
      label: "路由路径",
      prop: "path",
      align: "left"
    },
    {
      label: "组件路径",
      prop: "component",
      align: "left",
      formatter: ({ path, component }) =>
        isAllEmpty(component) ? path : component
    },
    {
      label: "权限标识",
      prop: "auths",
      align: "left",
      minWidth: 120
    },
    {
      label: "排序",
      prop: "sort",
      width: 100
    },
    // {
    //   label: "隐藏",
    //   prop: "showLink",
    //   formatter: ({ showLink }) => (showLink ? "否" : "是"),
    //   width: 100
    // },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    // const { data } = await getMenuList(); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    const { data } = await getAllMenuList({}); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    let newData = data;
    if (!isAllEmpty(form.title)) {
      // 前端搜索菜单名称
      newData = newData.filter(item =>
        transformI18n(item.title).includes(form.title)
      );
    }
    dataList.value = handleTree(newData); // 处理成树结构
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function formatHigherMenuOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].title = transformI18n(treeList[i].title);
      formatHigherMenuOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  const menuParam = ref({});

  /**
   * 处理新增菜单操作
   */
  const debounceHandleAddMenu: any = debounce(
    (operation, title, done) => {
      addMenu(menuParam.value).then(res => {
        if (res.code === 0) {
          message(`您${operation}了菜单名称为 [${title}] 的这条数据`, {
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
   * 处理修改菜单操作
   * @param operation 操作类型
   * @param title 菜单名称
   * @param done 关闭弹窗
   */
  const debounceHandleUpdateMenu: any = debounce(
    (operation, title, done) => {
      updateMenuById(menuParam.value).then(res => {
        if (res.code === 0) {
          message(`您${operation}了菜单名称为 [${title}] 的这条数据`, {
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

  function openDialog(title = "新增", row?: FormItemProps) {
    console.log(JSON.stringify(row));
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          id: row?.id ?? 0,
          menuType: row?.menuType ?? 0,
          higherMenuOptions: formatHigherMenuOptions(cloneDeep(dataList.value)),
          parentId: row?.parentId ?? 0,
          title: row?.title ?? "",
          name: row?.name ?? "",
          path: row?.path ?? "",
          component: row?.component ?? "",
          sort: row?.sort ?? 99,
          redirect: row?.redirect ?? "",
          icon: row?.icon ?? "",
          extraIcon: row?.extraIcon ?? "",
          enterTransition: row?.enterTransition ?? "",
          leaveTransition: row?.leaveTransition ?? "",
          activePath: row?.activePath ?? "",
          auths: row?.auths ?? "",
          frameSrc: row?.frameSrc ?? "",
          frameLoading: row?.frameLoading ?? 1,
          keepAlive: row?.keepAlive ?? 0,
          hiddenTag: row?.hiddenTag ?? 0,
          fixedTag: row?.fixedTag ?? 0,
          showLink: row?.showLink ?? 1,
          showParent: row?.showParent ?? 0
        }
      },
      width: "45%",
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
            menuParam.value = curData;
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              // 防抖(3秒内连续点击只会执行第一次点击事件)
              debounceHandleAddMenu(title, curData.title, done);
            } else {
              // 实际开发先调用修改接口，再进行下面操作
              // 防抖(3秒内连续点击只会执行第一次点击事件)
              debounceHandleUpdateMenu(title, curData.title, done);
            }
          }
        });
      }
    });
  }

  function handleDelete(row) {
    deleteMenuById(row.id).then(res => {
      if (res.code === 0) {
        message(`您删除了菜单名称为${row.title}的这条数据`, {
          type: "success"
        });
        onSearch();
      } else {
        message(`您删除菜单名称为${row.title}的数据失败`, {
          type: "error"
        });
      }
    });

    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改菜单 */
    openDialog,
    /** 删除菜单 */
    handleDelete,
    handleSelectionChange
  };
}
