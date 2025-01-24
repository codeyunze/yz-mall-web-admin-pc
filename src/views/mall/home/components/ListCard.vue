<script setup lang="ts">
import { computed, PropType, reactive } from "vue";
import { Star, Share } from "@element-plus/icons-vue";
import { addCart } from "@/api/pms";
import { message } from "@/utils/message";

defineOptions({
  name: "MallProductCard"
});

interface CardProductType {
  type: number;
  isSetup: boolean;
  description: string;
  name: string;
  id: string;
  price: number;
  titles: string;
  remark: string;
  albumPics: string;
  quantity: number;
}

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

const cardLogoClass = computed(() => ["list-card-item"]);

/**
 * 商品加入购物车
 * @param productId 商品Id
 */
function addToCart(productId) {
  console.log("加入购物车: {}", productId);
  const cart = reactive({
    productId: productId
  });
  addCart(cart).then(res => {
    if (res.code === 0) {
      message("商品加入购物车成功", { type: "success" });
    }
  });
}
</script>

<template>
  <div :class="cardClass">
    <div class="list-card-item_detail bg-bg_color">
      <el-row justify="space-between">
        <div :class="cardLogoClass">
          <img
            src="../img/iPhone16Pro.png"
            height="846"
            width="898"
            alt="商品图片"
          />
        </div>
        <div class="list-card-item_detail--operation">
          价格：
          <!--<span style="margin: 0 5px; text-decoration: line-through"
            >{{ product.price }}$</span
          >-->
          <span style="margin: 0 5px">{{ product.price }}$</span>
          <!--:color="product.isSetup ? '#00a870' : '#eee'"-->
          <el-tag
            :color="'#00a870'"
            effect="dark"
            class="mx-1 list-card-item_detail--operation--tag"
          >
            已启用
          </el-tag>
        </div>
      </el-row>
      <p class="list-card-item_detail--name text-text_color_primary">
        {{ product.name }}
      </p>
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
      <el-button type="primary" @click="addToCart(product.id)"
        >加入购物车</el-button
      >
      <el-button type="primary" :icon="Star" plain circle />
      <el-button type="primary" :icon="Share" plain circle />
    </div>
  </div>
</template>

<style scoped lang="scss">
.list-card-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 8px;

  &_detail {
    flex: 1;
    min-height: 140px;
    padding: 24px 32px;

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

    &--operation {
      display: flex;
      height: 100%;

      &--tag {
        border: 0;
      }
    }

    &--name {
      margin: 10px 0 8px;
      font-size: 16px;
      font-weight: 400;
    }

    &--tag {
      display: -webkit-box;
      height: 25px;
      margin-bottom: 5px;
      overflow: hidden;
      font-size: 12px;
      line-height: 20px;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &--desc {
      display: -webkit-box;
      height: 40px;
      margin-bottom: 24px;
      overflow: hidden;
      font-size: 14px;
      line-height: 20px;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  &__disabled {
    .list-card-item_detail--name,
    .list-card-item_detail--desc {
      color: var(--el-text-color-disabled);
    }

    .list-card-item_detail--operation--tag {
      color: #bababa;
    }
  }
}
</style>
