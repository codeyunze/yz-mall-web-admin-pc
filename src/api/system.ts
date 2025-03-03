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
export const fileUploadUrl = baseUrlApi("/file/upload");
/** 文件预览地址 */
export const filePreviewUrl = baseUrlApi("/file/preview");
/** 公开文件预览地址 */
export const filePublicPreviewUrl = baseUrlApi("/file/public/preview");
