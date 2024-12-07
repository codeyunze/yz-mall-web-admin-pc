import { http } from "@/utils/http";
import { baseUrlApi } from "@/api/utils";

type Result = {
  code: number;
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", baseUrlApi("/sys/user/getUserMenus"));
  // return http.request<Result>("get", "/sys/user/getUserMenus");
};
