<script setup lang="ts">
import { ref, onMounted, nextTick, reactive } from "vue";
import ListCard from "./components/ListCard.vue";
import { pmsProductInfo } from "@/api/pms";

defineOptions({
  productName: "MallHomePage"
});

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

const INITIAL_DATA = {
  productName: "",
  status: "",
  description: "",
  type: "",
  mark: ""
};

const pagination = ref({ current: 1, pageSize: 20, total: 0 });

interface ProductItem {
  id: number | string; // 商品ID，从 /pms/product/info 接口返回的 id 字段
  productName: string;
  productPrice: number;
  titles: string;
  remark: string;
  productImages: string[];
  isSetup: boolean;
  type?: number;
  description?: string;
  albumPics?: string;
  quantity?: number;
  [key: string]: any;
}

const productList = ref<ProductItem[]>([]);
const dataLoading = ref(true);
const lastProductId = ref(0);
const searchValue = ref("");

const getCardListData = async () => {
  try {
    const queryFilter = reactive({
      queryInfo: searchValue.value,
      lastProductId: lastProductId.value
    });
    const { data } = await pmsProductInfo(queryFilter);
    if (data && data.length > 0) {
      // 使用 /pms/product/info 接口返回的 id 字段
      // 注意：id可能是大整数，需要保持为字符串或使用BigInt，避免精度丢失
      const lastItem = data[data.length - 1];
      // 如果id是字符串，尝试转换为数字；如果是数字，直接使用
      // 但要注意JavaScript数字精度限制，大整数会丢失精度
      const idValue =
        typeof lastItem.id === "string" ? Number(lastItem.id) : lastItem.id;
      lastProductId.value = idValue || 0;
      if (productList.value.length > 0) {
        productList.value.push(...data);
      } else {
        productList.value = data;
      }

      pagination.value.current = 1;
      pagination.value.pageSize = productList.value.length;
      pagination.value.total = productList.value.length;
    }
  } catch (e) {
    console.log(e);
  } finally {
    setTimeout(() => {
      dataLoading.value = false;
    }, 500);
  }
};

onMounted(() => {
  productList.value = [];
  lastProductId.value = 0;
  getCardListData();
});

// const formDialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });

const handleManageProduct = (product: ProductItem) => {
  // formDialogVisible.value = true;
  nextTick(() => {
    formData.value = {
      ...INITIAL_DATA,
      ...product,
      status: product?.isSetup ? "1" : "0",
      description: product.remark || "",
      type: product.type?.toString() || "",
      mark: product.titles || ""
    };
  });
};
const load = () => {
  getCardListData();
};
</script>

<template>
  <div>
    <div class="w-full flex justify-between mb-4">
      <el-input
        v-model="searchValue"
        style="width: 500px"
        placeholder="搜索商品"
        size="large"
        clearable
      >
        <template #suffix>
          <el-icon class="el-input__icon">
            <IconifyIconOffline
              v-show="searchValue.length === 0"
              icon="ri:search-line"
            />
          </el-icon>
        </template>
      </el-input>
    </div>
    <div
      v-loading="dataLoading"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-empty
        v-show="
          productList
            .slice(
              pagination.pageSize * (pagination.current - 1),
              pagination.pageSize * pagination.current
            )
            .filter(v =>
              v.productName.toLowerCase().includes(searchValue.toLowerCase())
            ).length === 0
        "
        :description="`${searchValue} 产品不存在`"
      />
      <template v-if="pagination.total > 0">
        <div v-infinite-scroll="load" class="product-grid">
          <div
            v-for="(product, index) in productList
              .slice(
                pagination.pageSize * (pagination.current - 1),
                pagination.pageSize * pagination.current
              )
              .filter(v =>
                v.productName.toLowerCase().includes(searchValue.toLowerCase())
              )"
            :key="index"
            class="card-col"
          >
            <ListCard
              :product="{
                ...product,
                id: String(product.id), // 确保使用 /pms/product/info 返回的 id 字段，并转换为字符串
                type: product.type ?? 0,
                description: product.remark || '',
                albumPics: product.albumPics || '',
                quantity: product.quantity ?? 0
              }"
              @manage-product="handleManageProduct"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 16px; // 固定间距，水平和垂直都是16px
  margin-bottom: 24px;
}

.card-col {
  width: 100%;
  min-width: 330px;
}
</style>
