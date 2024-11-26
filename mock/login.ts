// 根据角色动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/login",
    method: "post",
    response: ({ body }) => {
      if (body.username === "admin") {
        return {
          code: 0,
          msg: "成功",
          data: {
            avatar: "https://avatars.githubusercontent.com/u/56632502",
            username: "root",
            nickname: "云泽",
            // 一个用户可能有多个角色
            roles: ["admin", "unqid"],
            // 按钮级别权限
            permissions: ["*:*:*"],
            accessToken: "6b9730d6f65945de98a2f4745c30cc54",
            refreshToken: "4414a9cffa274db089b6083da2bfc0d2",
            expires: "2035/11/19 21:25:01"
          }
        };
      } else {
        return {
          code: 0,
          msg: "成功",
          data: {
            avatar: "https://avatars.githubusercontent.com/u/52823142",
            username: "common",
            nickname: "小林",
            roles: ["common"],
            permissions: ["permission:btn:add", "permission:btn:edit"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.common",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.commonRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      }
    }
  }
]);
