const Layout = () => import("@/layout/index.vue");

export default {
  path: "/tw",
  name: "Tw",
  component: Layout,
  redirect: "/tw/series",
  meta: {
    icon: "ep:guide",
    title: "车辆管理",
    rank: 20
  },
  children: [
    {
      path: "/tw/series",
      name: "TwVehicleSeries",
      component: () => import("@/views/tw/series/index.vue"),
      meta: {
        icon: "ep:list",
        title: "车系管理"
      }
    },
    {
      path: "/tw/model",
      name: "TwVehicleModel",
      component: () => import("@/views/tw/model/index.vue"),
      meta: {
        icon: "ep:list",
        title: "车型管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
