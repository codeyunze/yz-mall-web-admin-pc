<script setup lang="ts">
import dayjs from "dayjs";
import { h, onMounted, ref } from "vue";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import datasourceForm from "./datasource-form.vue";
import {
  deleteTenantDatasource,
  getTenantDatasourceList,
  initTenantDb,
  saveOrUpdateTenantDatasource
} from "@/api/system";

const props = defineProps<{
  tenantId: string | number;
  tenantName: string;
}>();

const loading = ref(false);
const datasourceList = ref<any[]>([]);
const formRef = ref();

async function loadList() {
  loading.value = true;
  const res = await getTenantDatasourceList(props.tenantId);
  if (res.code === 200) {
    datasourceList.value = Array.isArray(res.data) ? res.data : [];
  } else {
    message(res.msg || "查询数据源失败", { type: "error" });
  }
  loading.value = false;
}

function openDatasourceForm(title = "新增连接", row?: any) {
  const isEdit = Boolean(row?.id);
  addDialog({
    title: `${title} - ${props.tenantName}`,
    width: "55%",
    closeOnClickModal: false,
    props: {
      formInline: {
        id: row?.id,
        tenantId: props.tenantId,
        serviceCode: row?.serviceCode ?? "",
        dbType: row?.dbType ?? "mysql",
        dbHost: row?.dbHost ?? "",
        dbPort: row?.dbPort ?? 3306,
        dbName: row?.dbName ?? "",
        dbUsername: row?.dbUsername ?? "",
        dbPasswordEnc: "",
        dbParams: row?.dbParams ?? "",
        dsStatus: row?.dsStatus ?? 1,
        remark: row?.remark ?? ""
      },
      isEdit
    },
    contentRenderer: () =>
      h(datasourceForm, { ref: formRef, formInline: null, isEdit }),
    beforeSure: done => {
      const FormRef = formRef.value.getRef();
      const formData = formRef.value.getFormData();
      FormRef.validate((valid: boolean) => {
        if (!valid) return;
        saveOrUpdateTenantDatasource(formData).then(res => {
          if (res.code === 200) {
            message("数据源保存成功", { type: "success" });
            done();
            loadList();
          } else {
            message(res.msg || "数据源保存失败", { type: "error" });
          }
        });
      });
    }
  });
}

function handleDelete(row: any) {
  deleteTenantDatasource(row.id).then(res => {
    if (res.code === 200) {
      message(`已删除服务连接 ${row.serviceCode}`, { type: "success" });
      loadList();
    } else {
      message(res.msg || "删除失败", { type: "error" });
    }
  });
}

function handleInitDb(row: any) {
  initTenantDb(props.tenantId, row.serviceCode).then(res => {
    if (res.code === 200 && res.data) {
      message(`服务 ${row.serviceCode} 建库成功`, { type: "success" });
    } else {
      message(res.msg || `服务 ${row.serviceCode} 建库失败`, { type: "error" });
    }
  });
}

onMounted(() => {
  loadList();
});
</script>

<template>
  <div class="datasource-manager">
    <div class="mb-3 flex justify-between items-center">
      <el-tag type="info">租户：{{ tenantName }}</el-tag>
      <el-button type="primary" @click="openDatasourceForm()"
        >新增服务连接</el-button
      >
    </div>
    <el-table v-loading="loading" :data="datasourceList" border>
      <el-table-column prop="serviceCode" label="服务标识" min-width="130" />
      <el-table-column prop="dbType" label="数据库类型" width="110" />
      <el-table-column prop="dbHost" label="主机" min-width="140" />
      <el-table-column prop="dbPort" label="端口" width="90" />
      <el-table-column prop="dbName" label="数据库名" min-width="130" />
      <!-- <el-table-column prop="dbUsername" label="用户名" min-width="120" /> -->
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.dsStatus === 1 ? 'success' : 'danger'">
            {{ row.dsStatus === 1 ? "启用" : "停用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="160">
        <template #default="{ row }">
          {{
            row.updateTime
              ? dayjs(row.updateTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"
          }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="openDatasourceForm('编辑连接', row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            title="确认删除当前服务连接？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm
            :title="`确认对服务 [${row.serviceCode}] 执行建库初始化？`"
            @confirm="handleInitDb(row)"
          >
            <template #reference>
              <el-button link type="primary">建库</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
