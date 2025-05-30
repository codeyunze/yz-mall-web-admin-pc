import { http } from "@/utils/http";
import { baseUrlApi } from "@/api/utils";
import type { ResultTable } from "./type";

export type UserResult = {
  code: number;
  msg: string;
  data: {
    userId: string;
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  code: number;
  success: boolean;
  msg: string;
  data: {
    userId: string;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type UserInfo = {
  /** 头像 */
  avatar: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 邮箱 */
  email: string;
  /** 联系电话 */
  phone: string;
  /** 简介 */
  description: string;
};

export type UserInfoResult = {
  code: number;
  success: boolean;
  data: UserInfo;
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", baseUrlApi("/login"), { data });
};

/** 登出 */
export const logout = () => {
  return http.request("get", baseUrlApi("/logout"));
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", baseUrlApi("/refreshToken"), {
    data
  });
};

/** 账户设置-个人信息 */
export const getMine = (data?: object) => {
  return http.request<UserInfoResult>("get", "/mine", { data });
};

/** 账户设置-个人安全日志 */
export const getMineLogs = (data?: object) => {
  return http.request<ResultTable>("get", "/mine-logs", { data });
};

/** 分页查询用户信息 */
export const pageUserInfo = (data?: object) => {
  return http.request<ResultTable>("post", "/sys/user/page", {
    data
  });
};

/** 用户密码重置 */
export const resetPassword = (data?: object) => {
  return http.request<UserInfoResult>(
    "post",
    baseUrlApi("/sys/user/resetPassword"),
    {
      data
    }
  );
};

/** 查询登录用户的信息 */
export const getUserInfo = () => {
  return http.request<UserResult>("get", baseUrlApi("/getUserInfo"));
};
