import { message } from "@/utils/message";
import { ref, reactive, type Ref, onMounted } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import { getAuPage } from "@/api/au";

export function useColumns(selectRef: Ref) {
  const selectValue = ref("");
  const columns: TableColumnList = [
    {
      label: "剩余数量（克）",
      prop: "quantity"
    },
    {
      label: "交易价格（元/克）",
      prop: "price"
    },
    {
      label: "盈利金额（元）",
      prop: "profitAmount"
    }
  ];

  const dataList = ref([]);

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 5,
    currentPage: 1,
    layout: "prev, pager, next",
    total: 0,
    background: true,
    size: "small"
  });

  /** 高亮当前选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === selectValue.value ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 行点击 */
  function onRowClick(row) {
    selectValue.value = row.id;
    selectRef.value.blur();
    this.$emit("set-relation-id");
    message(`当前选中行的数据为：${JSON.stringify(row)}`, { type: "success" });
  }

  /** 买入信息记录查询 */
  function onSearch() {
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: {
        transactionType: 0
      }
    };
    getAuPage(queryFilter).then(data => {
      dataList.value = data.data.items;
      pagination.total = Number(data.data.total);
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    columns,
    pagination,
    selectValue,
    dataList,
    rowStyle,
    onRowClick
  };
}
