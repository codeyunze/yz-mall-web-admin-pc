<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import {
  Star,
  Share,
  ShoppingCart,
  Picture as IconPicture
} from "@element-plus/icons-vue";
import { addCart, getSkuListByProductId } from "@/api/pms";
import { toAccessibleFileUrl, firstAlbumPicPreviewUrl } from "@/api/utils";
import { getToken } from "@/utils/auth";
import { fenToYuan } from "@/utils/money";
import { message } from "@/utils/message";
import { carUseColumns } from "@/views/mall/cart/utils/hook";
import { useRouter } from "vue-router";

defineOptions({
  name: "MallProductCard"
});

interface CardProductType {
  type: number;
  isSetup: boolean;
  description: string;
  productName: string;
  id: string;
  productPrice: number;
  titles: string;
  remark: string;
  albumPics: string;
  quantity: number;
  productImages: string[];
}

const tableRef = ref();
const router = useRouter();
const { openDialog } = carUseColumns(tableRef, false);

const props = defineProps({
  product: {
    type: Object as PropType<CardProductType>
  }
});

const emit = defineEmits(["manage-product", "delete-item"]);

const cardClass = computed(() => [
  "list-card-item",
  // { "list-card-item__disabled": !props.product.isSetup }
  { "list-card-item__disabled": false }
]);

const cardLogoClass = computed(() => ["list-card-item", "block"]);

/** 库存为 0 视为已售罄 */
const isSoldOut = computed(() => (props.product?.quantity ?? 0) <= 0);

/**
 * 商品加入购物车：需关联 SKU；多规格时跳转详情选择
 */
async function addToCart(productId) {
  if (isSoldOut.value) {
    message("商品已售罄", { type: "warning" });
    return;
  }
  try {
    const skuRes = await getSkuListByProductId(productId);
    if (skuRes.code !== 200) {
      message(skuRes.msg || "获取商品规格失败", { type: "error" });
      return;
    }
    const skus = Array.isArray(skuRes.data) ? skuRes.data : [];
    if (skus.length === 0) {
      message("商品未配置规格，无法加入购物车", { type: "warning" });
      return;
    }
    if (skus.length > 1) {
      message("请选择商品规格", { type: "info" });
      router.push(`/mall/product/${productId}`);
      return;
    }
    const res = await addCart({
      productId,
      skuId: skus[0].id,
      quantity: 1
    });
    if (res.code === 200) {
      message("商品加入购物车成功", { type: "success" });
    }
  } catch (e) {
    message("加入购物车失败", { type: "error" });
  }
}

function addOrder(product?: CardProductType) {
  if (isSoldOut.value) {
    message("商品已售罄", { type: "warning" });
    return;
  }
  const param = {
    productId: product.id,
    productName: product.productName,
    quantity: 1,
    price: product.productPrice,
    albumPics: product.albumPics,
    previewAddress:
      toAccessibleFileUrl(
        product.productImages?.[0],
        getToken()?.accessToken
      ) || firstAlbumPicPreviewUrl(product.albumPics, getToken()?.accessToken)
  };
  openDialog(param);
}
</script>

<template>
  <div :class="cardClass">
    <div class="list-card-item_detail bg-bg_color">
      <div
        :class="cardLogoClass"
        class="list-card-item_detail--header"
        style="cursor: pointer"
        @click="$router.push(`/mall/product/${product.id}`)"
      >
        <el-tag
          v-if="isSoldOut"
          class="list-card-item_detail--soldout"
          type="info"
          effect="dark"
          size="small"
        >
          已售罄
        </el-tag>
        <el-image
          :src="
            product && product.productImages && product.productImages.length > 0
              ? toAccessibleFileUrl(product.productImages[0])
              : ''
          "
          alt="商品图片"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><icon-picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <p
        class="list-card-item_detail--name text-text_color_primary"
        style="cursor: pointer"
        @click="$router.push(`/mall/product/${product.id}`)"
      >
        {{ product.productName }}
      </p>
      <div class="list-card-item_detail--price">
        <span class="list-card-item_detail--price--label">价格：</span>
        <span class="list-card-item_detail--price--value"
          >￥{{ fenToYuan(product.productPrice) }}</span
        >
        <el-tag
          v-if="isSoldOut"
          type="info"
          size="small"
          class="list-card-item_detail--price--tag"
        >
          已售罄
        </el-tag>
      </div>
      <p class="list-card-item_detail--tag text-text_color_regular">
        <el-tag
          v-for="(title, index) in product.titles.split(' ')"
          :key="index"
          type="primary"
          style="margin-right: 5px"
        >
          {{ title }}
        </el-tag>
      </p>
      <p class="list-card-item_detail--desc text-text_color_regular">
        {{ product.remark }}
      </p>
      <div class="list-card-item_detail--actions">
        <el-button-group class="list-card-item_detail--actions--group">
          <el-button :icon="Star" plain />
          <el-button :icon="Share" plain />
          <el-button
            :icon="ShoppingCart"
            plain
            :disabled="isSoldOut"
            @click="addToCart(product.id)"
          />
        </el-button-group>
        <el-button
          type="primary"
          plain
          class="list-card-item_detail--actions--buy"
          :disabled="isSoldOut"
          @click="addOrder(product)"
          >立即购买</el-button
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list-card-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 330px;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  border-radius: 8px;

  &_detail {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    padding: 24px 32px;

    &--header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 16px;
      overflow: visible;
    }

    &--soldout {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 2;
    }

    &--logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      font-size: 26px;
      color: #0052d9;
      background: #e0ebff;
      border-radius: 50%;

      &__disabled {
        color: #a1c4ff;
      }
    }

    &--name {
      position: relative;
      z-index: 1;
      display: -webkit-box;
      padding: 12px 0;
      margin: 0;
      overflow: hidden;
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &--price {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;

      &--label {
        color: var(--el-text-color-regular);
      }

      &--value {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      &--tag {
        border: 0;
      }
    }

    &--tag {
      display: -webkit-box;
      min-height: 25px;
      margin-bottom: 12px;
      overflow: hidden;
      font-size: 12px;
      line-height: 20px;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &--desc {
      display: -webkit-box;
      flex: 1;
      min-height: 40px;
      margin-bottom: 24px;
      overflow: hidden;
      font-size: 14px;
      line-height: 20px;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &--actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;

      @media (width <= 480px) {
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &--group {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        &--buy {
          width: 100%;
        }
      }

      &--group {
        flex-shrink: 0;
      }

      &--buy {
        flex-shrink: 0;
      }
    }
  }

  &__disabled {
    .list-card-item_detail--name,
    .list-card-item_detail--desc {
      color: var(--el-text-color-disabled);
    }

    .list-card-item_detail--price--tag {
      color: #bababa;
    }
  }
}

.block {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 252px;
  min-width: 252px;
  height: 252px;
  min-height: 252px;
  padding: 0;
  margin: 0 auto;
  overflow: hidden;
  border: none;
  border-radius: 10px;
}

.block .demonstration {
  display: block;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.block .el-image {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 252px;
  height: 252px;

  :deep(.el-image__inner) {
    display: block;
    width: 252px;
    height: 252px;
    object-fit: contain;
  }
}

.block .image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 30px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.block .image-slot .el-icon {
  font-size: 30px;
}
</style>
