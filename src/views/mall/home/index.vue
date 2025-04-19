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

const productList = ref([]);
const dataLoading = ref(true);
const lastProductId = ref(0);

const getCardListData = async () => {
  try {
    const queryFilter = reactive({
      queryInfo: searchValue,
      lastProductId: lastProductId
    });
    const { data } = await pmsProductInfo(queryFilter);
    lastProductId.value = data[data.length - 1].id;
    if (productList.value.length > 0) {
      productList.value.push(...data);
    } else {
      productList.value = data;
    }

    pagination.value.current = 1;
    pagination.value.pageSize = productList.value.length;
    pagination.value.total = productList.value.length;
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
const searchValue = ref("");

const handleManageProduct = product => {
  // formDialogVisible.value = true;
  nextTick(() => {
    formData.value = { ...product, status: product?.isSetup ? "1" : "0" };
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
        <el-row v-infinite-scroll="load" :gutter="16">
          <el-col
            v-for="(product, index) in productList
              .slice(
                pagination.pageSize * (pagination.current - 1),
                pagination.pageSize * pagination.current
              )
              .filter(v =>
                v.productName.toLowerCase().includes(searchValue.toLowerCase())
              )"
            :key="index"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <ListCard
              :product="product"
              @manage-product="handleManageProduct"
            />
          </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>
