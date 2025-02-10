export type ResultTable = {
  code: number;
  msg: string;
  data?: {
    list: Array<any>;
    /** 列表数据 */
    items: Array<any>;
    /** 总条目数 */
    total: number;
  };
};

export type Result = {
  code: number;
  success: boolean;
  data?: Array<any>;
  msg: string;
};
