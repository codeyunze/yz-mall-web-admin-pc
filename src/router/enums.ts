// 完整版菜单比较多，将 rank 抽离出来，在此方便维护

const home = 0, // 平台规定只有 home 路由的 rank 才能为 0 ，所以后端在返回 rank 的时候需要从非 0 开始
  ganttastic = 102,
  components = 103,
  able = 104,
  table = 105,
  form = 106,
  list = 107,
  result = 108,
  error = 109,
  frame = 110,
  permission = 112,
  system = 113,
  monitor = 114,
  tabs = 115,
  about = 116,
  editor = 117,
  flowchart = 118,
  guide = 123,
  menuoverflow = 124;

export {
  home,
  ganttastic,
  components,
  able,
  table,
  form,
  list,
  result,
  error,
  frame,
  permission,
  system,
  monitor,
  tabs,
  about,
  editor,
  flowchart,
  guide,
  menuoverflow
};
