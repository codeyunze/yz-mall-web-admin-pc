import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
import type { ResultTable, Result } from "./type";

/** 车系管理-分页查询 */
export const getSeriesPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/tw/series/page"), {
    data
  });
};

/** 车型管理-分页查询 */
export const getModelPage = (data?: object) => {
  return http.request<ResultTable>("post", baseUrlApi("/tw/model/page"), {
    data
  });
};

/** 车系管理-详情 */
export const getSeriesDetail = (id: number) => {
  return http.request<Result>("get", baseUrlApi(`/tw/series/${id}`));
};

/** 车型管理-详情 */
export const getModelDetail = (id: number) => {
  return http.request<Result>("get", baseUrlApi(`/tw/model/${id}`));
};

/** 车系管理-新增 */
export const addSeries = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/tw/series"), { data });
};

/** 车型管理-新增 */
export const addModel = (data?: object) => {
  return http.request<Result>("post", baseUrlApi("/tw/model"), { data });
};

/** 车系管理-编辑 */
export const editSeries = (data?: object) => {
  return http.request<Result>("put", baseUrlApi("/tw/series"), { data });
};

/** 车型管理-编辑 */
export const editModel = (data?: object) => {
  return http.request<Result>("put", baseUrlApi("/tw/model"), { data });
};

/** 车系管理-启停 */
export const updateSeriesStatus = (data?: object) => {
  return http.request<Result>("put", baseUrlApi("/tw/series/status"), { data });
};

/** 车型管理-启停 */
export const updateModelStatus = (data?: object) => {
  return http.request<Result>("put", baseUrlApi("/tw/model/status"), { data });
};

/** 车系管理-删除 */
export const deleteSeries = (id: number) => {
  return http.request<Result>("delete", baseUrlApi(`/tw/series/${id}`));
};

/** 车型管理-删除 */
export const deleteModel = (id: number) => {
  return http.request<Result>("delete", baseUrlApi(`/tw/model/${id}`));
};

/** 车系管理-启用车系下拉选项 */
export const getSeriesOptions = () => {
  return http.request<Result>("get", baseUrlApi("/tw/series/options"));
};
