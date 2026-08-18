import dayjs from "dayjs";
import editForm from "../form.vue";
import keyForm from "../key-form.vue";
import authForm from "../auth-form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { AdaptiveConfig, PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h, toRaw } from "vue";

import {
  getOpenClientPage,
  getOpenClientById,
  addOpenClient,
  updateOpenClient,
  deleteOpenClient,
  switchOpenClientStatus,
  uploadOpenClientKey,
  generateOpenClientKey,
  listOpenClientAuth,
  grantOpenClientAuth,
  revokeOpenClientAuth,
  getOpenServerPublicKey
} from "@/api/system";

export function useOpenClient() {
  const form = reactive({
    clientId: "",
    clientName: "",
    status: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90
    },
    {
      label: "客户端ID",
      prop: "clientId",
      minWidth: 220,
      align: "left"
    },
    {
      label: "应用名称",
      prop: "clientName",
      minWidth: 150
    },
    {
      label: "联系人",
      prop: "contactName",
      minWidth: 100
    },
    {
      label: "联系电话",
      prop: "contactPhone",
      minWidth: 130
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="启用"
          inactive-text="禁用"
          inline-prompt
          style="var(--el-switch-on-color: var(--el-color-success))"
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 90
    },
    {
      label: "到期时间",
      prop: "expireTime",
      minWidth: 160,
      formatter: ({ expireTime }) =>
        expireTime ? dayjs(expireTime).format("YYYY-MM-DD HH:mm:ss") : "长期"
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "操作",
      fixed: "right",
      width: 380,
      slot: "operation"
    }
  ];

  const buttonClass = [
    "!h-[20px]",
    "reset-margin",
    "!text-gray-500",
    "dark:!text-white",
    "dark:hover:!text-primary"
  ];

  const adaptiveConfig: AdaptiveConfig = {
    offsetBottom: 110
  };

  async function onSearch() {
    loading.value = true;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: form
    };
    const { data } = await getOpenClientPage(toRaw(queryFilter));
    dataList.value = data.items;
    pagination.total = Number(data.total);
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 启停切换 */
  function onChange({ row, index }) {
    switchLoadMap.value[index] = Object.assign({}, switchLoadMap.value[index], {
      loading: true
    });
    switchOpenClientStatus(row.id).then(res => {
      if (res.code === 200) {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          { loading: false }
        );
        message(`已${row.status === 0 ? "禁用" : "启用"}${row.clientName}`, {
          type: "success"
        });
      } else {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
        message(`${row.status === 0 ? "禁用" : "启用"}${row.clientName}失败`, {
          type: "error"
        });
      }
    });
  }

  /** 删除 */
  function handleDelete(row) {
    deleteOpenClient(row.id).then(res => {
      if (res.code === 200) {
        onSearch();
        message(`您删除了客户端 [${row.clientName}] 的这条数据`, {
          type: "success"
        });
      } else {
        message(res.msg, { type: "error" });
      }
    });
  }

  /** 新增/编辑弹窗 */
  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}客户端`,
      props: {
        formInline: {
          id: row?.id ?? undefined,
          clientName: row?.clientName ?? "",
          contactName: row?.contactName ?? "",
          contactPhone: row?.contactPhone ?? "",
          expireTime: row?.expireTime ?? "",
          ipWhitelist: row?.ipWhitelist ?? "",
          rateLimitQps: row?.rateLimitQps ?? undefined,
          remark: row?.remark ?? ""
        }
      },
      width: "46%",
      style: {
        "border-radius": "12px"
      },
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores(extraMsg?: string) {
          message(
            extraMsg || `您${title}了客户端 [${curData.clientName}] 的这条数据`,
            { type: "success", duration: extraMsg ? 8000 : 3000 }
          );
          done();
          onSearch();
        }
        FormRef.validate(valid => {
          if (valid) {
            if (title === "新增") {
              addOpenClient(curData).then(res => {
                if (res.code === 200) {
                  const clientId = res.data?.clientId;
                  if (clientId) {
                    addDialog({
                      title: "新建客户端成功",
                      width: "46%",
                      style: { "border-radius": "12px" },
                      hideFooter: true,
                      contentRenderer: () => (
                        <div style="padding: 0 20px 12px;">
                          <el-alert
                            type="success"
                            title="请复制并告知第三方系统使用下列 clientId"
                            closable={false}
                            style="margin-bottom: 16px;"
                          />
                          <el-form label-width="100px">
                            <el-form-item label="应用名称">
                              <el-input value={curData.clientName} disabled />
                            </el-form-item>
                            <el-form-item label="客户端ID">
                              <el-input value={clientId} readonly />
                            </el-form-item>
                          </el-form>
                        </div>
                      )
                    });
                    chores(`新建成功，clientId：${clientId}`);
                  } else {
                    chores();
                  }
                }
              });
            } else {
              updateOpenClient(curData).then(res => {
                if (res.code === 200) {
                  chores();
                }
              });
            }
          }
        });
      }
    });
  }

  /** 上传公钥弹窗 */
  function openKeyDialog(row) {
    const keyFormRef = ref();
    addDialog({
      title: `上传公钥 - ${row.clientName}`,
      props: {
        formInline: {
          clientId: row.clientId,
          clientPublicKey: "",
          remark: ""
        }
      },
      width: "50%",
      style: {
        "border-radius": "12px"
      },
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(keyForm, { ref: keyFormRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = keyFormRef.value.getRef();
        const curData = options.props.formInline;
        FormRef.validate(valid => {
          if (valid) {
            uploadOpenClientKey(curData).then(res => {
              if (res.code === 200) {
                message(`客户端 [${row.clientName}] 公钥上传成功`, {
                  type: "success"
                });
                done();
              }
            });
          }
        });
      }
    });
  }

  /** 平台生成密钥对 */
  function handleGenerateKey(row) {
    generateOpenClientKey(row.clientId).then(res => {
      if (res.code === 200) {
        const { publicKey, privateKey } = res.data;
        addDialog({
          title: `密钥对生成结果 - ${row.clientName}`,
          width: "60%",
          style: {
            "border-radius": "12px"
          },
          draggable: true,
          closeOnClickModal: false,
          hideFooter: true,
          contentRenderer: () => (
            <div style="padding: 0 20px;">
              <el-alert
                type="warning"
                title="私钥仅此次展示，请立即妥善保存，关闭后将无法再次获取！"
                closable={false}
                style="margin-bottom: 16px;"
              />
              <el-form label-width="100px">
                <el-form-item label="客户端ID">
                  <el-input value={row.clientId} disabled />
                </el-form-item>
                <el-form-item label="公钥">
                  <el-input
                    value={publicKey}
                    type="textarea"
                    rows={4}
                    readonly
                  />
                </el-form-item>
                <el-form-item label="私钥">
                  <el-input
                    value={privateKey}
                    type="textarea"
                    rows={4}
                    readonly
                  />
                </el-form-item>
              </el-form>
            </div>
          )
        });
      }
    });
  }

  /** 授权管理弹窗 */
  function openAuthDialog(row) {
    const authFormRef = ref();
    // 先加载已有授权
    listOpenClientAuth(row.clientId).then(res => {
      const grantedCodes = res.data
        ? res.data.map(item => item.permissionCode)
        : [];
      addDialog({
        title: `授权管理 - ${row.clientName}`,
        props: {
          formInline: {
            clientId: row.clientId,
            permissionCodes: grantedCodes,
            remark: ""
          }
        },
        width: "46%",
        style: {
          "border-radius": "12px"
        },
        draggable: true,
        closeOnClickModal: false,
        contentRenderer: () =>
          h(authForm, { ref: authFormRef, formInline: null }),
        beforeSure: (done, { options }) => {
          const curData = options.props.formInline;
          const newCodes = curData.permissionCodes;
          // 计算需要授予和撤销的
          const toGrant = newCodes.filter(c => !grantedCodes.includes(c));
          const toRevoke = grantedCodes.filter(c => !newCodes.includes(c));

          const tasks = [];
          if (toGrant.length > 0) {
            tasks.push(
              grantOpenClientAuth({
                clientId: row.clientId,
                permissionCodes: toGrant,
                remark: curData.remark
              })
            );
          }
          if (toRevoke.length > 0) {
            tasks.push(
              revokeOpenClientAuth({
                clientId: row.clientId,
                permissionCodes: toRevoke
              })
            );
          }

          if (tasks.length === 0) {
            message("授权未变更", { type: "info" });
            done();
            return;
          }

          Promise.all(tasks).then(results => {
            if (results.every(r => r.code === 200)) {
              message(`客户端 [${row.clientName}] 授权更新成功`, {
                type: "success"
              });
              done();
            }
          });
        }
      });
    });
  }

  /** 详情（公钥摘要 + 授权） */
  function openDetailDialog(row) {
    getOpenClientById(row.id).then(res => {
      if (res.code !== 200 || !res.data) {
        message(res.msg || "加载详情失败", { type: "error" });
        return;
      }
      const detail = res.data;
      const key = detail.currentKey;
      const authList = detail.authList || [];
      addDialog({
        title: `客户端详情 - ${detail.clientName}`,
        width: "56%",
        style: { "border-radius": "12px" },
        hideFooter: true,
        contentRenderer: () => (
          <div style="padding: 0 20px 12px;">
            <el-descriptions column={2} border>
              <el-descriptions-item label="客户端ID" span={2}>
                {detail.clientId}
              </el-descriptions-item>
              <el-descriptions-item label="应用名称">
                {detail.clientName}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                {detail.status === 1 ? "启用" : "禁用"}
              </el-descriptions-item>
              <el-descriptions-item label="联系人">
                {detail.contactName || "-"}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {detail.contactPhone || "-"}
              </el-descriptions-item>
              <el-descriptions-item label="到期时间">
                {detail.expireTime
                  ? dayjs(detail.expireTime).format("YYYY-MM-DD HH:mm:ss")
                  : "长期"}
              </el-descriptions-item>
              <el-descriptions-item label="QPS上限">
                {detail.rateLimitQps ?? "不限制"}
              </el-descriptions-item>
              <el-descriptions-item label="IP白名单" span={2}>
                {detail.ipWhitelist || "不限制"}
              </el-descriptions-item>
              <el-descriptions-item label="备注" span={2}>
                {detail.remark || "-"}
              </el-descriptions-item>
            </el-descriptions>
            <div style="margin-top: 16px; font-weight: 600;">当前公钥</div>
            {key ? (
              <el-descriptions column={1} border style="margin-top: 8px;">
                <el-descriptions-item label="版本">
                  v{key.keyVersion}
                </el-descriptions-item>
                <el-descriptions-item label="SM3指纹">
                  {key.fingerprint}
                </el-descriptions-item>
                <el-descriptions-item label="公钥预览">
                  {key.publicKeyPreview}
                </el-descriptions-item>
                <el-descriptions-item label="生效时间">
                  {key.effectTime
                    ? dayjs(key.effectTime).format("YYYY-MM-DD HH:mm:ss")
                    : "-"}
                </el-descriptions-item>
              </el-descriptions>
            ) : (
              <el-empty description="尚未备案公钥" image-size={60} />
            )}
            <div style="margin-top: 16px; font-weight: 600;">有效授权</div>
            {authList.length ? (
              <el-table data={authList} size="small" style="margin-top: 8px;">
                <el-table-column prop="permissionCode" label="权限码" />
                <el-table-column
                  prop="grantTime"
                  label="授权时间"
                  width="180"
                  formatter={(_r, _c, v) =>
                    v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "-"
                  }
                />
              </el-table>
            ) : (
              <el-empty description="尚未配置授权" image-size={60} />
            )}
          </div>
        )
      });
    });
  }

  /** 下载平台服务端公钥 */
  function handleDownloadServerPublicKey() {
    getOpenServerPublicKey().then(res => {
      if (res.code !== 200 || !res.data?.serverPublicKey) {
        message(res.msg || "获取服务端公钥失败", { type: "error" });
        return;
      }
      const serverPublicKey = res.data.serverPublicKey;
      addDialog({
        title: "平台服务端公钥",
        width: "56%",
        style: { "border-radius": "12px" },
        hideFooter: true,
        contentRenderer: () => (
          <div style="padding: 0 20px 12px;">
            <el-alert
              type="info"
              title="请将此公钥提供给第三方，用于 SM2 加密 SM4 会话密钥"
              closable={false}
              style="margin-bottom: 16px;"
            />
            <el-input
              value={serverPublicKey}
              type="textarea"
              rows={8}
              readonly
            />
          </div>
        )
      });
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    formRef,
    loading,
    columns,
    dataList,
    pagination,
    buttonClass,
    adaptiveConfig,
    onSearch,
    resetForm,
    openDialog,
    openKeyDialog,
    openAuthDialog,
    openDetailDialog,
    handleGenerateKey,
    handleDownloadServerPublicKey,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}
