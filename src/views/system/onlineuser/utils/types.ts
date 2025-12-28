/** 在线用户信息 */
export interface OnlineUserItemProps {
  /** 用户ID */
  userId: string | number;
  /** 用户名 */
  username: string;
  /** 登录IP */
  loginIp: string;
  /** 登录地点 */
  loginLocation: string;
  /** 操作系统 */
  os: string;
  /** 浏览器 */
  browser: string;
  /** 登录时间 */
  loginTime: string;
}
