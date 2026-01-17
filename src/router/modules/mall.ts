const Layout = () => import("@/layout/index.vue");

export default {
  path: "/mall",
  name: "Mall",
  component: Layout,
  redirect: "/mall/home",
  meta: {
    icon: "ep:shopping-bag",
    title: "商城",
    rank: 10
  },
  children: [
    {
      path: "/mall/product/:id",
      name: "ProductDetail",
      component: () => import("@/views/mall/product/detail.vue"),
      meta: {
        title: "商品详情",
        showLink: false,
        activePath: "/mall/home"
      }
    }
  ]
} satisfies RouteConfigsTable;
