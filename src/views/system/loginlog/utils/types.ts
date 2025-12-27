/** 登录日志信息 */
export interface LoginLogItemProps {
  /** 日志ID */
  id: string | number;
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
  /** 状态：0-失败，1-成功 */
  status: number;
  /** 登录类型 */
  loginType: number;
  /** 登录时间 */
  loginTime: string;
  /** 创建时间 */
  createTime: string;
}
