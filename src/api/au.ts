import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type ResultTable = {
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

type Result = {
  code: number;
  success: boolean;
  data?: Array<any>;
  msg: string;
};

/** 黄金-分页查询 */
export const getAuPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/sys/account/au/page"), {
    data
  });
};

/** 黄金-新增交易记录 */
export const addAuRecord = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/account/au/add"), {
    data
  });
};

/** 黄金-更新交易记录 */
export const updateAuRecordById = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/sys/account/au/update"), {
    data
  });
};

/** 黄金-删除交易记录 */
export const deleteAuRecordById = (data?: object) => {
  return http.request<Result>(
    "delete",
    baseUrlApi(`/sys/account/au/delete/${data}`)
  );
};
