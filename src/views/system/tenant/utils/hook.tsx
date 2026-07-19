import dayjs from "dayjs";
import editForm from "../form.vue";
import datasourceManager from "../datasource-manager.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "./types";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import { deviceDetection } from "@pureadmin/utils";
import type { PaginationProps } from "@pureadmin/table";
import {
  addTenant,
  deleteTenant,
  getTenantById,
  getTenantPage,
  updateTenant
} from "@/api/system";

export function useTenant() {
  const loading = ref(true);
  const dataList = ref([]);
  const formRef = ref();
  const form = reactive({
    tenantCode: "",
    tenantName: "",
    tenantStatus: null
  });

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 20,
    currentPage: 1,
    pageSizes: [20, 40, 60],
    background: true
  });

  const columns: TableColumnList = [
    { label: "租户编码", prop: "tenantCode", minWidth: 140 },
    { label: "租户名称", prop: "tenantName", minWidth: 160 },
    {
      label: "到期时间",
      prop: "expireTime",
      minWidth: 170,
      formatter: ({ expireTime }) =>
        expireTime ? dayjs(expireTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "租户状态",
      prop: "tenantStatus",
      width: 120,
      cellRenderer: ({ row }) => {
        const statusMap = {
          0: { type: "danger", text: "停用" },
          1: { type: "success", text: "启用" }
        };
        const status = statusMap[row.tenantStatus] || statusMap[0];
        return <el-tag type={status.type as any}>{status.text}</el-tag>;
      }
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 170,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    { label: "操作", fixed: "right", width: 320, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    const query = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: toRaw(form)
    };
    const { data } = await getTenantPage(query);
    dataList.value = data.items || [];
    pagination.total = Number(data.total || 0);
    loading.value = false;
  }

  function resetForm(formEl: any) {
    if (!formEl) {
      return;
    }
    formEl.resetFields();
    form.tenantStatus = null;
    pagination.currentPage = 1;
    onSearch();
  }

  async function openDialog(title = "新增", row?: FormItemProps) {
    let currentRow = row;
    if (title === "修改" && row?.id) {
      const detailRes = await getTenantById(row.id);
      if (detailRes.code !== 200 || !detailRes.data) {
        message(detailRes.msg || "获取租户详情失败", { type: "error" });
        return;
      }
      currentRow = detailRes.data as FormItemProps;
    }
    addDialog({
      title: `${title}租户`,
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      props: {
        formInline: {
          id: currentRow?.id,
          tenantCode: currentRow?.tenantCode ?? "",
          tenantName: currentRow?.tenantName ?? "",
          contactName: currentRow?.contactName ?? "",
          contactPhone: currentRow?.contactPhone ?? "",
          expireTime: currentRow?.expireTime ?? "",
          tenantStatus: currentRow?.tenantStatus ?? 1,
          remark: currentRow?.remark ?? ""
        }
      },
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: done => {
        const FormRef = formRef.value.getRef();
        const formData = formRef.value.getFormData();
        FormRef.validate((valid: boolean) => {
          if (valid) {
            const request =
              title === "新增" ? addTenant(formData) : updateTenant(formData);
            request.then(res => {
              if (res.code === 200) {
                message(`租户${title}成功`, { type: "success" });
                done();
                onSearch();
              } else {
                message(res.msg || `租户${title}失败`, { type: "error" });
              }
            });
          }
        });
      }
    });
  }

  function openDatasourceDialog(row: FormItemProps) {
    addDialog({
      title: `管理连接 - ${row.tenantName}`,
      width: "80%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      beforeSure: done => done(),
      contentRenderer: () =>
        h(datasourceManager, {
          tenantId: row.id,
          tenantName: row.tenantName
        })
    });
  }

  function handleDelete(row: FormItemProps) {
    deleteTenant(row.id as string).then(res => {
      if (res.code === 200) {
        message(`已删除租户 ${row.tenantName}`, { type: "success" });
        onSearch();
      } else {
        message(res.msg || "删除失败", { type: "error" });
      }
    });
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

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
    dataList,
    form,
    pagination,
    onSearch,
    resetForm,
    openDialog,
    openDatasourceDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}
