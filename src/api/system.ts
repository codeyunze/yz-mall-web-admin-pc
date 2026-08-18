import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { Result, ResultTable } from "./type";

/** 获取系统管理-用户管理列表 */
export const getUserList = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/user/page"), {
    data
  });
};

/** 系统管理-用户管理-切换用户状态 */
export const switchUserStatus = (data?: object) => {
  return http.request<Result>("post", baseUrlApi(`/sys/user/switch/${data}`));
};

/** 系统管理-用户管理-新增用户 */
export const addUser = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/user/add"), { data });
};

/** 系统管理-用户管理-更新用户 */
export const updateUserById = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/user/update"), { data });
};

/** 系统管理-用户管理-获取所有角色列表 */
export const getAllRoleList = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/role/list"), { data });
};

/** 系统管理-用户管理-根据userId，获取对应角色id列表（userId：用户id） */
export const getRoleIds = (data?: object) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/user/getUserRoles/${data}`)
  );
};

/** 获取系统管理-角色管理列表 */
export const getRoleList = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/role/page"), {
    data
  });
};

/** 系统管理-角色管理-更新角色 */
export const updateRoleById = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/role/update"), {
    data
  });
};

/** 系统管理-角色管理-新增角色 */
export const addRole = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/role/add"), {
    data
  });
};

/** 系统管理-角色管理-切换角色状态 */
export const switchRoleStatus = (data?: object) => {
  return http.request<Result>("post", baseUrlApi(`/sys/role/switch/${data}`));
};

/** 系统管理-角色管理-删除角色 */
export const deleteRoleById = (data?: object) => {
  return http.request<Result>("delete", baseUrlApi(`/sys/role/delete/${data}`));
};

/** 系统管理-用户&角色-绑定 */
export const bindRoleForUser = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/user/role/bind"), {
    data
  });
};

/** 获取系统管理-菜单管理列表 */
export const getMenuList = (data?: object) => {
  return http.request<Result>("post", "/menu", { data });
};

/** 获取系统管理-菜单管理列表 */
export const getAllMenuList = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/menu/list"), { data });
};

/** 系统管理-更新菜单 */
export const updateMenuById = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/menu/update"), { data });
};

/** 系统管理-新增菜单 */
export const addMenu = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/menu/add"), { data });
};

/** 系统管理-删除菜单 */
export const deleteMenuById = (data?: object) => {
  return http.request<Result>("delete", baseUrlApi(`/sys/menu/delete/${data}`));
};

/** 获取系统管理-部门管理列表 */
export const getDeptList = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/org/list"), { data });
};

/** 系统管理-组织部门-新增 */
export const addDept = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/org/add"), { data });
};

/** 系统管理-组织部门-更新 */
export const updateDept = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/org/update"), { data });
};

/** 系统管理-组织部门-更新 */
export const deleteDept = (data?: object) => {
  return http.request<Result>("delete", baseUrlApi(`/sys/org/delete/${data}`));
};

/** 获取系统监控-在线用户列表 */
export const getOnlineLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/online-logs", { data });
};

/** 获取系统监控-登录日志列表 */
export const getLoginLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/login-logs", { data });
};

/** 获取系统监控-操作日志列表 */
export const getOperationLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/operation-logs", { data });
};

/** 获取系统监控-系统日志列表 */
export const getSystemLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/system-logs", { data });
};

/** 获取系统监控-系统日志-根据 id 查日志详情 */
export const getSystemLogsDetail = (data?: object) => {
  return http.request<Result>("post", "/system-logs-detail", { data });
};

/** 获取系统管理-消息重试列表 */
export const getMsgRetryList = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/msgRetry/page"), {
    data
  });
};

/** 获取系统管理-消息重试详情 */
export const getMsgRetryDetail = (id: number | string) => {
  return http.request<
    Result<import("@/views/system/msgretry/utils/types").MsgRetryItemProps>
  >("get", baseUrlApi(`/sys/msgRetry/get/${id}`));
};

/** 获取角色管理-权限-菜单权限 */
export const getRoleMenu = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/menu/listSlim"), {
    data
  });
};

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (data?: object) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/role/menu/getRoleMenus/${data}`)
  );
};

/** 系统管理-角色&菜单-绑定 */
export const bindMenuForRole = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/role/menu/bind"), {
    data
  });
};

/** 获取用户管理-根据用户Id删除用户信息 */
export const deleteByUserId = (data?: object) => {
  return http.request<Result>("delete", baseUrlApi(`/sys/user/delete/${data}`));
};

/** 分页查询用户待办信息 */
export const getUserTaskList = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/tasks/page"), {
    data
  });
};

/** 待办开始 */
export const addTask = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/tasks/add"), {
    data
  });
};

/** 待办结束 */
export const endTask = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/tasks/end"), {
    data
  });
};

/** 收货地址信息-分页查询 */
export const pageReceiptInfo = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/receipt/page"), {
    data
  });
};

/** 收货地址信息-新增 */
export const addReceiptInfo = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/receipt/add"), {
    data
  });
};

/** 收货地址信息-修改 */
export const updateReceiptInfo = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/receipt/update"), {
    data
  });
};

/** 收货地址信息-删除 */
export const deleteReceiptInfo = (data?: object) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/sys/receipt/delete/${data}`)
  );
};

/** 查询指定行政地区所下辖的行政区域 */
export const getRegionByParent = (data?: string) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/area/getRegionByParent/${data}`)
  );
};

/** 查询指定行政区域的信息 */
export const getRegionById = (data?: string) => {
  return http.request<Result>("get", baseUrlApi(`/sys/area/get/${data}`));
};

/** 数据字典-分页查询 */
export const getDictionaryPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/dictionary/page"), {
    data
  });
};

/** 数据字典-新增 */
export const addDictionary = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/dictionary/add"), {
    data
  });
};

/** 数据字典-更新 */
export const updateDictionaryById = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/dictionary/update"), {
    data
  });
};

/** 数据字典-删除 */
export const deleteDictionaryById = (data?: object) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/sys/dictionary/delete/${data}`)
  );
};

/** 数据字典-获取所有列表（用于下拉选择） */
export const getAllDictionaryList = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/dictionary/list"), {
    data
  });
};

/** 数据字典-根据id获取单个字典信息 */
export const getDictionaryById = (id?: string | number) => {
  return http.request<Result>("get", baseUrlApi(`/sys/dictionary/get/${id}`));
};

export type FileInfo = {
  // 0: 公开；1: 不公开；
  publicAccess: number;
  // 存储模式: local、cos、oss
  fileStorageMode: string;
  // 存储站
  fileStorageStation: string;
  // 文件Id
  fileId: string;
};

/** 文件上传地址 */
export const fileUploadUrl = baseUrlApi("/sys/file/upload");
/** 文件预览地址 */
export const filePreviewUrl = (fileId?: string | number, token?: string) => {
  return baseUrlApi(`/sys/file/preview/${fileId}?token=${token}`);
};
/** 文件下载地址 */
export const fileDownloadUrl = (fileId?: string | number) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/file/download/${fileId}`)
  );
};

/** 文件管理-分页查询 */
export const getFilePage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/file/page"), {
    data
  });
};

/** 文件管理-删除文件 */
export const deleteFileById = (fileId?: string | number) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/sys/file/delete/${fileId}`)
  );
};

/** 登录日志管理-分页查询 */
export const getLoginLogPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/loginLog/page"), {
    data
  });
};

/** 登录日志管理-清空日志 */
export const clearLoginLog = () => {
  return http.request<Result>("post", baseUrlApi("/sys/loginLog/clear"));
};

/** 在线用户管理-分页查询 */
export const getOnlineUserList = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/onlineUser/list"), {
    data
  });
};

/** 在线用户管理-踢下线 */
export const kickoutOnlineUser = (userId: string | number) => {
  return http.request<Result>(
    "post",
    baseUrlApi(`/sys/onlineUser/kickoutByUserId/${userId}`)
  );
};

/** 租户管理-分页查询 */
export const getTenantPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/tenant/page"), {
    data
  });
};

/** 租户管理-新增 */
export const addTenant = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/tenant/add"), {
    data
  });
};

/** 租户管理-修改 */
export const updateTenant = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/tenant/update"), {
    data
  });
};

/** 租户管理-详情 */
export const getTenantById = (
  id: string | number,
  serviceCode?: string | null
) => {
  const serviceQuery =
    serviceCode && serviceCode.trim().length > 0
      ? `?serviceCode=${encodeURIComponent(serviceCode)}`
      : "";
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/tenant/get/${id}${serviceQuery}`)
  );
};

/** 租户管理-查询租户下数据源 */
export const getTenantDatasourceList = (tenantId: string | number) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/tenant/datasource/list/${tenantId}`)
  );
};

/** 租户管理-保存/更新数据源 */
export const saveOrUpdateTenantDatasource = (data?: object) => {
  return http.request<Result>(
    "post",
    baseUrlApi("/sys/tenant/datasource/saveOrUpdate"),
    {
      data
    }
  );
};

/** 租户管理-删除数据源 */
export const deleteTenantDatasource = (id: string | number) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/sys/tenant/datasource/delete/${id}`)
  );
};

/** 租户管理-删除 */
export const deleteTenant = (id: string | number) => {
  return http.request<Result>("delete", baseUrlApi(`/sys/tenant/delete/${id}`));
};

/** 租户管理-建库并初始化 */
export const initTenantDb = (
  id: string | number,
  serviceCode?: string | null
) => {
  const serviceQuery =
    serviceCode && serviceCode.trim().length > 0
      ? `?serviceCode=${encodeURIComponent(serviceCode)}`
      : "";
  return http.request<Result>(
    "post",
    baseUrlApi(`/sys/tenant/initDb/${id}${serviceQuery}`)
  );
};

/* ========================================
 * 第三方访问授权管理 - 开放客户端
 * ======================================== */

/** 第三方客户端-分页查询 */
export const getOpenClientPage = (data?: object) => {
  return http.request<ResultTable>(
    "post",
    baseUrlApi("/sys/open/client/page"),
    {
      data
    }
  );
};

/** 第三方客户端-详情 */
export const getOpenClientById = (id: string | number) => {
  return http.request<Result>("get", baseUrlApi(`/sys/open/client/get/${id}`));
};

/** 第三方客户端-新增 */
export const addOpenClient = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/open/client/add"), {
    data
  });
};

/** 第三方客户端-编辑 */
export const updateOpenClient = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/open/client/update"), {
    data
  });
};

/** 第三方客户端-切换启停状态 */
export const switchOpenClientStatus = (id: string | number) => {
  return http.request<Result>(
    "post",
    baseUrlApi(`/sys/open/client/switch/${id}`)
  );
};

/** 第三方客户端-删除 */
export const deleteOpenClient = (id: string | number) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/sys/open/client/delete/${id}`)
  );
};

/** 第三方客户端-上传公钥 */
export const uploadOpenClientKey = (data?: object) => {
  return http.request<Result>(
    "post",
    baseUrlApi("/sys/open/client/key/upload"),
    { data }
  );
};

/** 第三方客户端-平台生成SM2密钥对（私钥仅此次返回） */
export const generateOpenClientKey = (clientId: string) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/open/client/key/generate?clientId=${clientId}`)
  );
};

/** 第三方客户端-查询当前生效公钥 */
export const getCurrentOpenClientKey = (clientId: string) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/open/client/key/current/${clientId}`)
  );
};

/** 第三方客户端-批量授予权限 */
export const grantOpenClientAuth = (data?: object) => {
  return http.request<Result>(
    "post",
    baseUrlApi("/sys/open/client/auth/grant"),
    { data }
  );
};

/** 第三方客户端-撤销权限 */
export const revokeOpenClientAuth = (data?: object) => {
  return http.request<Result>(
    "post",
    baseUrlApi("/sys/open/client/auth/revoke"),
    { data }
  );
};

/** 第三方客户端-查询有效授权列表 */
export const listOpenClientAuth = (clientId: string) => {
  return http.request<Result>(
    "get",
    baseUrlApi(`/sys/open/client/auth/list/${clientId}`)
  );
};

/** 下载平台服务端公钥 */
export const getOpenServerPublicKey = () => {
  return http.request<Result>("get", baseUrlApi("/sys/open/server-public-key"));
};

/** 可授权开放 API 权限码清单 */
export const getOpenPermissionOptions = () => {
  return http.request<Result>(
    "get",
    baseUrlApi("/sys/open/permission/options")
  );
};
