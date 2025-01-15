import { reactive, ref, type Ref, onMounted } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import { getAuChoosePage } from "@/api/au";

export function useColumns(selectRef: Ref, price: number) {
  const selectValue = ref("");
  const columns: TableColumnList = [
    {
      label: "ID",
      prop: "id",
      minWidth: 180
    },
    {
      label: "剩余数量（克）",
      prop: "quantity",
      minWidth: 150
    },
    {
      label: "建议卖出价格(元/克)",
      prop: "proposalPrice",
      minWidth: 150
    },
    {
      label: "交易时间",
      prop: "transactionTime",
      minWidth: 180
    }
  ];

  const queryPrice = ref(0);

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

  /**
   * 设置一页数据量
   * @param val 一页展示的数据量
   */
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch(queryPrice.value);
  }

  /**
   * 翻页
   * @param val 页码
   */
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch(queryPrice.value);
  }

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
    // message(`当前选中行的数据为：${JSON.stringify(row)}`, { type: "success" });
  }

  /** 买入信息记录查询 */
  function onSearch(paramPrice: number) {
    queryPrice.value = paramPrice;
    const queryFilter = {
      size: pagination.pageSize,
      current: pagination.currentPage,
      filter: {
        price: queryPrice.value
      }
    };
    getAuChoosePage(queryFilter).then(data => {
      dataList.value = data.data.items;
      pagination.total = Number(data.data.total);
    });
  }

  onMounted(() => {
    queryPrice.value = price;
  });

  return {
    columns,
    pagination,
    selectValue,
    dataList,
    rowStyle,
    onRowClick,
    onSearch,
    handleSizeChange,
    handleCurrentChange
  };
}
