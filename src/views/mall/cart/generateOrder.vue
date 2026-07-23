<script setup lang="ts">
import { onMounted, ref, h, watch } from "vue";
import { Order } from "./utils/types";
import type { CascaderProps } from "element-plus";
import { getRegionByParent, pageReceiptInfo } from "@/api/system";
import {
  addDialog,
  closeDialog,
  type DialogOptions
} from "@/components/ReDialog/index";
import AddressSelector from "./components/AddressSelector.vue";
import { message } from "@/utils/message";
import { toAccessibleFileUrl, firstAlbumPicPreviewUrl } from "@/api/utils";
import { getToken } from "@/utils/auth";
import { fenToYuan } from "@/utils/money";
import { Picture } from "@element-plus/icons-vue";

// 声明 props 类型
export interface FormProps {
  formInline: Order;
}

// 声明 props 默认值
// 推荐阅读：https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props
const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: "",
    orderCode: "",
    orderStatus: 0,
    orderType: 0,
    deliveryTime: "",
    confirmStatus: 0,
    receiveTime: "",
    payType: 0,
    totalAmount: 0.0,
    discountAmount: 0.0,
    payAmount: 0.0,
    note: "",
    receiverName: "",
    receiverPhone: "",
    receiverProvince: "",
    receiverCity: "",
    receiverDistrict: "",
    receiverProvinceName: "",
    receiverCityName: "",
    receiverDistrictName: "",
    receiverAddress: "",
    email: "",
    isDefault: 0
  })
});

const selectAddress = ref([]);

const addressProps: CascaderProps = {
  lazy: true,
  lazyLoad(node, resolve) {
    const { level, value } = node;
    getRegionByParent(level === 0 ? "-1" : value + "").then(res => {
      if (level == 2) {
        res.data.forEach(item => {
          item.leaf = true;
        });
      }
      resolve(res.data);
    });
  }
};

const handleAddressChange = (values: any) => {
  newFormInline.value.receiverProvince = values[0];
  newFormInline.value.receiverCity = values[1];
  newFormInline.value.receiverDistrict = values[2];
};

// vue 规定所有的 prop 都遵循着单向绑定原则，直接修改 prop 时，Vue 会抛出警告。此处的写法仅仅是为了消除警告。
// 因为对一个 reactive 对象执行 ref，返回 Ref 对象的 value 值仍为传入的 reactive 对象，
// 即 newFormInline === props.formInline 为 true，所以此处代码的实际效果，仍是直接修改 props.formInline。
// 但该写法仅适用于 props.formInline 是一个对象类型的情况，原始类型需抛出事件
// 推荐阅读：https://cn.vuejs.org/guide/components/props.html#one-way-data-flow
const newFormInline = ref(props.formInline);
const totalPrice = ref(0.0);

/**
 * 原地补齐商品预览图（保持与 props.formInline 同一引用，便于确认订单读取地址改动）
 */
function normalizeProductImages(val: Order) {
  const token = getToken()?.accessToken;
  if (!val?.products?.length) {
    return val;
  }
  val.products.forEach(product => {
    product.previewAddress =
      toAccessibleFileUrl(product?.previewAddress, token) ||
      firstAlbumPicPreviewUrl(product?.albumPics, token) ||
      "";
  });
  return val;
}

watch(
  () => props.formInline,
  val => {
    if (val) {
      newFormInline.value = normalizeProductImages(val);
    }
  },
  { immediate: true, deep: true }
);

/** 金额展示：接口为分，页面展示元 */
const formatAmount = (value: unknown) => fenToYuan(value as number);

// 更新地址信息
const updateAddress = (item: any) => {
  newFormInline.value.receiverName = item.receiverName || "";
  newFormInline.value.receiverPhone = item.receiverPhone || "";
  newFormInline.value.receiverProvince = item.receiverProvince || "";
  newFormInline.value.receiverCity = item.receiverCity || "";
  newFormInline.value.receiverDistrict = item.receiverDistrict || "";
  newFormInline.value.receiverProvinceName = item.receiverProvinceName || "";
  newFormInline.value.receiverCityName = item.receiverCityName || "";
  newFormInline.value.receiverDistrictName = item.receiverDistrictName || "";
  newFormInline.value.receiverAddress = item.receiverAddress || "";
  newFormInline.value.email = item.receiverEmail || item.email || "";
  newFormInline.value.isDefault = item.isDefault ?? 0;

  selectAddress.value[0] = newFormInline.value.receiverProvince;
  selectAddress.value[1] = newFormInline.value.receiverCity;
  selectAddress.value[2] = newFormInline.value.receiverDistrict;
};

/**
 * 优先取默认地址，否则取列表第一条
 */
function pickDefaultAddress(items: any[] = []) {
  if (!items.length) {
    return null;
  }
  return items.find(item => item.isDefault === 1) || items[0];
}

// 选择其他地址
const handleSelectOtherAddress = () => {
  let dialogIndex = 0;
  const dialogOptions: DialogOptions = {
    title: "选择收货地址",
    width: "50%",
    props: {
      currentAddress: {
        receiverName: newFormInline.value.receiverName,
        receiverPhone: newFormInline.value.receiverPhone,
        receiverProvince: newFormInline.value.receiverProvince,
        receiverCity: newFormInline.value.receiverCity,
        receiverDistrict: newFormInline.value.receiverDistrict,
        receiverProvinceName: newFormInline.value.receiverProvinceName,
        receiverCityName: newFormInline.value.receiverCityName,
        receiverDistrictName: newFormInline.value.receiverDistrictName,
        receiverAddress: newFormInline.value.receiverAddress,
        email: newFormInline.value.email
      }
    },
    contentRenderer: ({ options, index }) => {
      dialogIndex = index;
      return h(AddressSelector, {
        currentAddress: options.props.currentAddress,
        onSelect: (address: any) => {
          updateAddress(address);
          message("地址已更新", { type: "success" });
          // 关闭对话框
          closeDialog(dialogOptions, dialogIndex);
        }
      });
    },
    footerRenderer: () => null,
    closeOnClickModal: true
  };
  addDialog(dialogOptions);
};

onMounted(() => {
  totalPrice.value = 0;
  (newFormInline.value.products || []).forEach(product => {
    const price = Number(product.price || 0);
    const quantity = Number(product.quantity || 0);
    totalPrice.value += price * quantity;
  });

  // 详情页已传入地址时不再覆盖；否则加载默认地址
  if (newFormInline.value.receiverName && newFormInline.value.receiverAddress) {
    selectAddress.value[0] = newFormInline.value.receiverProvince;
    selectAddress.value[1] = newFormInline.value.receiverCity;
    selectAddress.value[2] = newFormInline.value.receiverDistrict;
    return;
  }

  const params = { filter: {} };
  pageReceiptInfo(params).then(res => {
    if (res.data.total === 0) {
      return;
    }
    const item = pickDefaultAddress(res.data.items);
    if (item) {
      updateAddress(item);
    }
  });
});
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-4">
      <el-card style="width: 100%">
        <el-row>
          <el-col>
            <el-descriptions :column="2">
              <el-descriptions-item :span="2" label="收货地址: "
                >{{
                  newFormInline.receiverProvinceName +
                  newFormInline.receiverCityName +
                  newFormInline.receiverDistrictName
                }}
              </el-descriptions-item>
              <el-descriptions-item :span="2" label="详细地址: ">
                <strong
                  ><span style="font-size: 18px">{{
                    newFormInline.receiverAddress
                  }}</span></strong
                >
              </el-descriptions-item>
              <el-descriptions-item label="收货人: ">
                {{ newFormInline.receiverName }}
                <el-tag
                  v-if="newFormInline.isDefault === 1"
                  size="small"
                  type="danger"
                  effect="plain"
                  class="ml-1"
                >
                  默认
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="收货人手机号: "
                >{{ newFormInline.receiverPhone }}
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <div style="text-align: center">
          <el-text type="primary">
            <a style="cursor: pointer" @click="handleSelectOtherAddress"
              >其它地址 >></a
            >
          </el-text>
        </div>
      </el-card>
    </div>

    <div class="flex flex-wrap gap-4" style="margin-top: 20px">
      <el-card
        v-for="product in newFormInline.products"
        :key="`${product.productId || product.id}-${product.skuId || ''}`"
        style="width: 100%"
        shadow="hover"
      >
        <el-row>
          <el-col :span="4">
            <el-image
              v-if="product.previewAddress"
              :key="product.previewAddress"
              style="width: 100px; height: 100px"
              fit="cover"
              :src="product.previewAddress"
            >
              <template #error>
                <div
                  class="flex items-center justify-center w-full h-full bg-[var(--el-fill-color-light)]"
                >
                  <el-icon :size="28"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div
              v-else
              class="flex items-center justify-center w-[100px] h-[100px] bg-[var(--el-fill-color-light)]"
            >
              <el-icon :size="28"><Picture /></el-icon>
            </div>
          </el-col>
          <el-col :span="20">
            <el-row>
              <el-col :span="16" class="colProduct"
                >商品: {{ product.productName }}</el-col
              >
              <el-col :span="8" class="colProduct"
                >原价:
                <span style="color: red"
                  >￥ {{ formatAmount(product.price) }}</span
                ></el-col
              >
              <el-col :span="16" class="colProduct"
                >SKU:
                {{ product.skuName || product.skuId || "默认规格" }}</el-col
              >
              <el-col :span="8" class="colProduct"
                >到手价: ￥
                {{
                  formatAmount(
                    product.realAmount ??
                      Number(product.price || 0) -
                        Number(product.discountAmount || 0)
                  )
                }}</el-col
              >
              <el-col :span="8" class="colProduct"
                >数量：{{ product.quantity }}</el-col
              >
              <el-col :span="8" class="colProduct"
                >共减: ￥
                {{ formatAmount(product.discountAmount || 0) }}</el-col
              >
              <el-col :span="8" class="colProduct"
                >合计: ￥
                {{
                  formatAmount(
                    Number(product.price || 0) * Number(product.quantity || 0)
                  )
                }}</el-col
              >
            </el-row>
            <!--<el-descriptions>
              <el-descriptions-item :span="2" label="商品: "
                >{{ product.productName }}
              </el-descriptions-item>
              <el-descriptions-item label="原价: "
                ><span style="color: red">￥ {{ product.price }}</span>
              </el-descriptions-item>

              <el-descriptions-item :span="2" label="SKU: "
                >XXX
              </el-descriptions-item>
              <el-descriptions-item label="到手价: "
                >￥0
                &lt;!&ndash;{{ product.realAmount }}&ndash;&gt;
              </el-descriptions-item>

              <el-descriptions-item label="数量: "
                >{{ product.quantity }}
              </el-descriptions-item>
              <el-descriptions-item label="共减: "
                >￥ 0&lt;!&ndash;{{ product.discountAmount }}&ndash;&gt;
              </el-descriptions-item>
              <el-descriptions-item label="合计: "
                >￥
                {{ product.price * product.quantity }}
              </el-descriptions-item>
            </el-descriptions>-->
          </el-col>
        </el-row>
      </el-card>
    </div>
    <!--可以添加一个商品金额、运费、立减、优惠卷、代金券等计算-->
    <!--<div></div>-->

    <div style="float: right; margin-top: 20px">
      合计
      <el-text type="danger" size="large" style="font-size: 24px">
        ￥{{ fenToYuan(totalPrice) }}
      </el-text>
    </div>
  </div>

  <!--<el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="收货人" prop="receiverName">
          <el-input
            v-model="newFormInline.receiverName"
            clearable
            placeholder="请输入收货人名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="手机号" prop="receiverPhone">
          <el-input
            v-model="newFormInline.receiverPhone"
            clearable
            placeholder="请输入收货手机号"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="通知邮件" prop="email">
          <el-input
            v-model="newFormInline.email"
            clearable
            placeholder="请输入通知消息接收邮件"
          />
        </el-form-item>
      </re-col>
      <re-col :value="24" :xs="24" :sm="24">
        <el-form-item label="收货地址" prop="receiverProvince">
          <el-cascader
            v-model="selectAddress"
            :props="addressProps"
            class="w-full"
            clearable
            placeholder="请选择收货地址"
            @change="handleAddressChange"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="详细地址" prop="receiverAddress">
          <el-input
            v-model="newFormInline.receiverAddress"
            placeholder="请输入详细信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="订单备注" prop="note">
          <el-input
            v-model="newFormInline.note"
            placeholder="请输入订单备注信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="实付款:">共减￥XXX.XX 合计￥XXX.XX </el-form-item>
      </re-col>
    </el-row>
  </el-form>-->
</template>

<style scoped>
.colProduct {
  height: 40px;
  line-height: 40px;
}
</style>
