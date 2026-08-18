const Layout = () => import("@/layout/index.vue");

/**
 * 开放平台静态路由。
 * 注意：禁止使用 path="/system" 作为父级，否则会与后端动态菜单（用户/角色/待办等）
 * 在 handleAsyncRoutes 中按 path 去重时冲突，导致 /system/tasks 等动态路由首次无法匹配。
 */
export default {
  path: "/open",
  name: "SystemOpen",
  component: Layout,
  redirect: "/open/client",
  meta: {
    icon: "ep:key",
    title: "开放平台",
    rank: 11
  },
  children: [
    {
      path: "/open/client",
      name: "SystemOpenClient",
      component: () => import("@/views/system/openclient/index.vue"),
      meta: {
        icon: "ep:connection",
        title: "第三方客户端",
        roles: ["admin", "运营"]
      }
    }
  ]
} satisfies RouteConfigsTable;
