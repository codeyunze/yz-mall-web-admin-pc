<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProductDetail, getSkuListByProductId, addCart } from "@/api/pms";
import { message } from "@/utils/message";
import { ShoppingCart, Plus, Minus, Picture } from "@element-plus/icons-vue";
import {
  addDialog,
  closeDialog,
  type DialogOptions
} from "@/components/ReDialog/index";
import AddressSelector from "@/views/mall/cart/components/AddressSelector.vue";
import { h, ref as vueRef } from "vue";
import { carUseColumns } from "@/views/mall/cart/utils/hook";

defineOptions({
  name: "ProductDetail"
});

const route = useRoute();
const router = useRouter();

// 商品信息
const product = ref<any>(null);
const loading = ref(true);
const quantity = ref(1);
const selectedSku = ref<any>(null);
const skuList = ref<any[]>([]);
const mainImageIndex = ref(0);

// 收货地址
const selectedAddress = ref<any>(null);

// 加载商品详情
const loadProductDetail = async () => {
  const productId = route.params.id as string;
  if (!productId) {
    message("商品ID不存在", { type: "error" });
    router.back();
    return;
  }

  loading.value = true;
  try {
    // 加载商品详情 - 直接使用字符串ID，避免大整数精度丢失
    const productRes = await getProductDetail(productId);
    if (productRes.code === 200 && productRes.data) {
      product.value = productRes.data;

      // 加载SKU列表 - 直接使用字符串ID，避免大整数精度丢失
      const skuRes = await getSkuListByProductId(productId);
      if (skuRes.code === 200 && skuRes.data) {
        skuList.value = skuRes.data || [];
        // 默认选择第一个SKU
        if (skuList.value.length > 0) {
          selectedSku.value = skuList.value[0];
        }
      }
    } else {
      message("商品不存在", { type: "error" });
      router.back();
    }
  } catch (error) {
    console.error("加载商品详情失败:", error);
    message("加载商品详情失败", { type: "error" });
    router.back();
  } finally {
    loading.value = false;
  }
};

// 当前价格
const currentPrice = computed(() => {
  if (selectedSku.value && selectedSku.value.price) {
    return selectedSku.value.price;
  }
  return product.value?.productPrice || 0;
});

// 选择SKU
const handleSelectSku = (sku: any) => {
  selectedSku.value = sku;
  quantity.value = 1; // 切换SKU时重置数量
};

// 数量增减
const handleQuantityChange = (delta: number) => {
  const newQuantity = quantity.value + delta;
  if (newQuantity < 1) {
    quantity.value = 1;
  } else if (newQuantity > 999) {
    quantity.value = 999;
  } else {
    // 暂时不限制库存，如果后端有库存字段可以在这里添加限制
    quantity.value = newQuantity;
  }
};

// 数量输入验证
const handleQuantityInput = (event: Event | string | number) => {
  let value: string;
  if (typeof event === "string") {
    value = event;
  } else if (typeof event === "number") {
    value = String(event);
  } else if (event && (event as any).target) {
    value = (event.target as HTMLInputElement).value;
  } else {
    return;
  }
  const numValue = parseInt(value, 10);
  if (isNaN(numValue) || numValue < 1) {
    quantity.value = 1;
  } else if (numValue > 999) {
    quantity.value = 999;
  } else {
    quantity.value = numValue;
  }
};

// 选择收货地址
const handleSelectAddress = () => {
  let dialogIndex = 0;
  const dialogOptions: DialogOptions = {
    title: "选择收货地址",
    width: "50%",
    props: {
      currentAddress: selectedAddress.value
    },
    contentRenderer: ({ options, index }) => {
      dialogIndex = index;
      return h(AddressSelector, {
        currentAddress: options.props.currentAddress,
        onSelect: (address: any) => {
          selectedAddress.value = address;
          message("地址已选择", { type: "success" });
          closeDialog(dialogOptions, dialogIndex);
        }
      });
    },
    footerRenderer: () => null,
    closeOnClickModal: true
  };
  addDialog(dialogOptions);
};

// 添加到购物车
const handleAddToCart = async () => {
  if (!selectedSku.value) {
    message("请选择SKU", { type: "warning" });
    return;
  }

  try {
    const params = {
      productId: product.value.id,
      skuId: selectedSku.value.id,
      quantity: quantity.value
    };
    const res = await addCart(params);
    if (res.code === 200) {
      message("已添加到购物车", { type: "success" });
    }
  } catch (error) {
    console.error("添加到购物车失败:", error);
    message("添加到购物车失败", { type: "error" });
  }
};

// 立即购买
const handleBuyNow = () => {
  if (!selectedSku.value) {
    message("请选择SKU", { type: "warning" });
    return;
  }

  const tableRef = vueRef();
  const { openDialog } = carUseColumns(tableRef, false);

  const param = {
    productId: product.value.id,
    productName: product.value.productName,
    skuId: selectedSku.value.id,
    skuName: selectedSku.value.skuName || selectedSku.value.skuCode,
    quantity: quantity.value,
    price: currentPrice.value,
    previewAddress: product.value.productImages?.[0] || ""
  };

  openDialog(param);
};

// 切换主图
const handleImageClick = (index: number) => {
  mainImageIndex.value = index;
};

onMounted(() => {
  loadProductDetail();
});
</script>

<template>
  <div v-loading="loading" class="product-detail">
    <div v-if="product" class="detail-container">
      <!-- 商品图片区域 -->
      <div class="product-images">
        <div class="main-image">
          <el-image
            v-if="product.productImages && product.productImages.length > 0"
            :src="product.productImages[mainImageIndex]"
            fit="contain"
            class="main-img"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
        <div
          v-if="product.productImages && product.productImages.length > 1"
          class="thumbnail-list"
        >
          <div
            v-for="(img, index) in product.productImages"
            :key="index"
            :class="['thumbnail-item', { active: mainImageIndex === index }]"
            @click="handleImageClick(index)"
          >
            <el-image :src="img" fit="cover" class="thumbnail-img">
              <template #error>
                <div class="thumbnail-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </div>

      <!-- 商品信息区域 -->
      <div class="product-info">
        <h1 class="product-title">{{ product.productName }}</h1>

        <div class="price-section">
          <span class="price-label">价格：</span>
          <span class="price-value">￥{{ currentPrice }}</span>
        </div>

        <!-- SKU选择 -->
        <div v-if="skuList.length > 0" class="sku-section">
          <div class="section-title">选择规格：</div>
          <div class="sku-list">
            <div
              v-for="sku in skuList"
              :key="sku.id"
              :class="['sku-item', { active: selectedSku?.id === sku.id }]"
              @click="handleSelectSku(sku)"
            >
              <span class="sku-name">{{ sku.skuName || sku.skuCode }}</span>
              <span v-if="sku.priceFee" class="sku-price"
                >￥{{ (sku.priceFee / 100).toFixed(2) }}</span
              >
            </div>
          </div>
        </div>

        <!-- 数量选择 -->
        <div class="quantity-section">
          <div class="section-title">数量：</div>
          <div class="quantity-control">
            <el-button
              :icon="Minus"
              :disabled="quantity <= 1 || !selectedSku"
              @click="handleQuantityChange(-1)"
            />
            <el-input
              v-model="quantity"
              :disabled="!selectedSku"
              class="quantity-input"
              type="number"
              :min="1"
              :max="999"
              @input="(val: string | number) => handleQuantityInput(val)"
              @blur="handleQuantityInput($event)"
              @keyup.enter="handleQuantityInput($event)"
            />
            <el-button
              :icon="Plus"
              :disabled="!selectedSku || quantity >= 999"
              @click="handleQuantityChange(1)"
            />
          </div>
        </div>

        <!-- 收货地址选择 -->
        <div class="address-section">
          <div class="section-title">收货地址：</div>
          <div v-if="selectedAddress" class="selected-address">
            <div class="address-info">
              <span class="receiver"
                >{{ selectedAddress.receiverName }}
                {{ selectedAddress.receiverPhone }}</span
              >
              <span class="address-text">
                {{ selectedAddress.receiverProvinceName
                }}{{ selectedAddress.receiverCityName
                }}{{ selectedAddress.receiverDistrictName }}
                {{ selectedAddress.receiverAddress }}
              </span>
            </div>
          </div>
          <el-button type="primary" plain @click="handleSelectAddress">
            {{ selectedAddress ? "更换地址" : "选择收货地址" }}
          </el-button>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button
            type="warning"
            size="large"
            :icon="ShoppingCart"
            @click="handleAddToCart"
          >
            加入购物车
          </el-button>
          <el-button type="danger" size="large" @click="handleBuyNow">
            立即购买
          </el-button>
        </div>

        <!-- 商品描述 -->
        <div v-if="product.remark" class="product-desc">
          <div class="section-title">商品描述：</div>
          <p class="desc-text">{{ product.remark }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-detail {
  min-height: calc(100vh - 100px);
  padding: 24px;
  background: var(--el-bg-color-page);
}

.detail-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  max-width: 1200px;
  padding: 24px;
  margin: 0 auto;
  background: var(--el-bg-color);
  border-radius: 8px;

  // 响应式布局：小屏幕时商品信息移动到图片下方
  @media (width <= 1024px) {
    flex-direction: column;
  }
}

.product-images {
  display: flex;
  flex: 0 0 500px;
  flex-direction: column;
  gap: 16px;

  // 响应式布局：小屏幕时图片区域占满宽度
  @media (width <= 1024px) {
    flex: 1 1 100%;
    width: 100%;
  }
}

.main-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 500px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;

  // 响应式布局：小屏幕时调整图片高度
  @media (width <= 1024px) {
    height: auto;
    min-height: 300px;
    max-height: 500px;
  }

  .main-img {
    width: 100%;
    height: 100%;
  }

  .image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 48px;
    color: var(--el-text-color-secondary);
  }
}

.thumbnail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--el-border-color);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &.active {
    border-color: var(--el-color-primary);
  }

  .thumbnail-img {
    width: 100%;
    height: 100%;
  }

  .thumbnail-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 24px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
  }
}

.product-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;

  // 响应式布局：小屏幕时商品信息区域占满宽度
  @media (width <= 1024px) {
    flex: 1 1 100%;
    width: 100%;
  }
}

.product-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.price-section {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;

  .price-label {
    font-size: 16px;
    color: var(--el-text-color-regular);
  }

  .price-value {
    font-size: 32px;
    font-weight: bold;
    color: var(--el-color-danger);
  }
}

.section-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.sku-section {
  .sku-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .sku-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 120px;
    padding: 12px 20px;
    cursor: pointer;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    transition: all 0.3s;

    &:hover:not(.disabled) {
      border-color: var(--el-color-primary);
    }

    &.active {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .sku-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    .sku-price {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-color-danger);
    }

    .sku-stock {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}

.quantity-section {
  .quantity-control {
    display: flex;
    gap: 12px;
    align-items: center;

    .quantity-input {
      width: 120px;

      // 隐藏 number 类型输入框的上下箭头按钮
      :deep(input[type="number"]) {
        text-align: center; // 数字居中显示
        appearance: textfield; // Firefox

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          margin: 0;
          appearance: none; // Chrome, Safari, Edge
        }
      }
    }
  }
}

.address-section {
  .selected-address {
    padding: 12px;
    margin-bottom: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;

    .address-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .receiver {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .address-text {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);

  .el-button {
    flex: 1;
  }
}

.product-desc {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);

  .desc-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: var(--el-text-color-regular);
    white-space: pre-wrap;
  }
}
</style>
