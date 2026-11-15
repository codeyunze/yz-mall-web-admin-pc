import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { faker } from "@faker-js/faker/locale/zh_CN";

export default defineFakeRoute([
  {
    url: "/sys/user/page",
    method: "post",
    response: () => {
      let list = [
        {
          id: "1858113817985785856",
          phone: "15346646668",
          email: null,
          password: "123456",
          balance: 2.01,
          createTime: "2024-11-17 19:43:51",
          invalid: 0
        },
        {
          id: "1858121948841132032",
          phone: "15346646669",
          email: "834363368@qq.com",
          password: "234567",
          balance: 5.01,
          createTime: "2024-11-17 20:16:09",
          invalid: 0
        },
        {
          id: "1858121948841132066",
          phone: "15346646671",
          email: "834363s12@outlook.com",
          password: "234567",
          balance: 5.91,
          createTime: "2024-11-17 21:16:24",
          invalid: 1
        }
      ];
      // list = list.filter(item => item.email.includes(body?.email));

      return {
        code: 0,
        success: true,
        data: {
          items: list,
          total: list.length // 总条目数
        }
      };
    }
  },
  // 账户设置-个人信息
  {
    url: "/mine",
    method: "get",
    response: () => {
      return {
        code: 0,
        success: true,
        data: {
          avatar: "https://avatars.githubusercontent.com/u/44761321",
          username: "admin",
          nickname: "小铭",
          email: "pureadmin@163.com",
          phone: "15888886789",
          description: "一个热爱开源的前端工程师"
        }
      };
    }
  },
  // 账户设置-个人安全日志
  {
    url: "/mine-logs",
    method: "get",
    response: () => {
      let list = [
        {
          id: 1,
          ip: faker.internet.ipv4(),
          address: "中国河南省信阳市",
          system: "macOS",
          browser: "Chrome",
          summary: "账户登录", // 详情
          operatingTime: new Date() // 时间
        },
        {
          id: 2,
          ip: faker.internet.ipv4(),
          address: "中国广东省深圳市",
          system: "Windows",
          browser: "Firefox",
          summary: "绑定了手机号码",
          operatingTime: new Date().setDate(new Date().getDate() - 1)
        }
      ];
      return {
        code: 0,
        success: true,
        data: {
          items: list,
          total: list.length // 总条目数
        }
      };
    }
  }
]);
