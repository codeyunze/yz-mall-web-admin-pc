import type { OptionsType } from "@/components/ReSegmented";

const menuTypeOptions: Array<OptionsType> = [
  {
    label: "菜单",
    value: 0
  },
  {
    label: "iframe",
    value: 1
  },
  {
    label: "外链",
    value: 2
  },
  {
    label: "按钮",
    value: 3
  },
  {
    label: "接口资源",
    value: 4
  }
];

const showLinkOptions: Array<OptionsType> = [
  {
    label: "显示",
    tip: "会在菜单中显示",
    value: 1
  },
  {
    label: "隐藏",
    tip: "不会在菜单中显示",
    value: 0
  }
];

const fixedTagOptions: Array<OptionsType> = [
  {
    label: "固定",
    tip: "当前菜单名称固定显示在标签页且不可关闭",
    value: 1
  },
  {
    label: "不固定",
    tip: "当前菜单名称不固定显示在标签页且可关闭",
    value: 0
  }
];

const keepAliveOptions: Array<OptionsType> = [
  {
    label: "缓存",
    tip: "会保存该页面的整体状态，刷新后会清空状态",
    value: 1
  },
  {
    label: "不缓存",
    tip: "不会保存该页面的整体状态",
    value: 0
  }
];

const hiddenTagOptions: Array<OptionsType> = [
  {
    label: "允许",
    tip: "当前菜单名称或自定义信息允许添加到标签页",
    value: 0
  },
  {
    label: "禁止",
    tip: "当前菜单名称或自定义信息禁止添加到标签页",
    value: 1
  }
];

const showParentOptions: Array<OptionsType> = [
  {
    label: "显示",
    tip: "会显示父级菜单",
    value: 1
  },
  {
    label: "隐藏",
    tip: "不会显示父级菜单",
    value: 0
  }
];

const frameLoadingOptions: Array<OptionsType> = [
  {
    label: "开启",
    tip: "有首次加载动画",
    value: 1
  },
  {
    label: "关闭",
    tip: "无首次加载动画",
    value: 0
  }
];

export {
  menuTypeOptions,
  showLinkOptions,
  fixedTagOptions,
  keepAliveOptions,
  hiddenTagOptions,
  showParentOptions,
  frameLoadingOptions
};
