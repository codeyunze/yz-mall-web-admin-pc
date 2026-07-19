<script setup lang="ts">
/**
 * SKU 库存明细表格（弹窗内容）
 */
defineOptions({
  name: "PmsSkuStockDialog"
});

defineProps<{
  list: Array<{
    skuId?: string | number;
    skuCode?: string;
    skuName?: string;
    quantity?: number;
  }>;
}>();
</script>

<template>
  <el-table :data="list" border stripe max-height="420" style="width: 100%">
    <el-table-column type="index" label="序号" width="60" align="center" />
    <el-table-column
      prop="skuCode"
      label="SKU编码"
      min-width="140"
      show-overflow-tooltip
    />
    <el-table-column
      prop="skuName"
      label="SKU名称"
      min-width="140"
      show-overflow-tooltip
    />
    <el-table-column
      prop="quantity"
      label="库存数量"
      width="110"
      align="center"
    />
  </el-table>
</template>
