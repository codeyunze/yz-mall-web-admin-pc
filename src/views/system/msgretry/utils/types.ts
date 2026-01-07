/** 消息重试记录信息 */
export interface MsgRetryItemProps {
  /** 主键ID */
  id: number;
  /** 业务数据ID */
  businessId?: string;
  /** 消息ID */
  msgId: string;
  /** 原始Topic */
  topic: string;
  /** 消息标签 */
  tags?: string;
  /** 消息内容 */
  body?: string;
  /** 异常信息 */
  exception?: string;
  /** 剩余重试次数 */
  retryCount: number;
  /** 重试历史，JSON格式 */
  retryHistory?: string;
  /** 状态: 0重试中/1待处理/2已处理/3忽略 */
  status: number;
  /** 消费者组 */
  consumerGroup?: string;
  /** 下次重试时间 */
  nextRetryTime?: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/** 查询表单 */
export interface MsgRetryQueryForm {
  /** 消息ID */
  msgId?: string;
  /** 业务数据ID */
  businessId?: string;
  /** Topic */
  topic?: string;
  /** 消息标签 */
  tags?: string;
  /** 消费者组 */
  consumerGroup?: string;
  /** 状态 */
  status?: number;
  /** 创建时间开始 */
  createTimeStart?: string;
  /** 创建时间结束 */
  createTimeEnd?: string;
}
