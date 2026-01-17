<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Check } from "@element-plus/icons-vue";
import { pageReceiptInfo } from "@/api/system";
import { message } from "@/utils/message";

// 定义收货地址类型
interface ReceiptAddress {
  id?: number;
  receiverName?: string;
  receiverPhone?: string;
  receiverProvince?: string;
  receiverCity?: string;
  receiverDistrict?: string;
  receiverProvinceName?: string;
  receiverCityName?: string;
  receiverDistrictName?: string;
  receiverAddress?: string;
  receiverEmail?: string;
}

interface Props {
  currentAddress?: {
    receiverName?: string;
    receiverPhone?: string;
    receiverProvince?: string;
    receiverCity?: string;
    receiverDistrict?: string;
    receiverProvinceName?: string;
    receiverCityName?: string;
    receiverDistrictName?: string;
    receiverAddress?: string;
    email?: string;
  };
}

interface Emits {
  (e: "select", address: ReceiptAddress): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);
const addressList = ref<ReceiptAddress[]>([]);
const selectedAddressId = ref<number | null>(null);

// 加载收货地址列表
const loadAddressList = async () => {
  loading.value = true;
  try {
    const params = {
      filter: {}
    };
    const res = await pageReceiptInfo(params);
    if (res.code === 200 && res.data) {
      addressList.value = res.data.items || [];
      // 如果有当前地址，尝试匹配并选中
      if (props.currentAddress) {
        const matched = addressList.value.find(
          item =>
            item.receiverName === props.currentAddress?.receiverName &&
            item.receiverPhone === props.currentAddress?.receiverPhone &&
            item.receiverAddress === props.currentAddress?.receiverAddress
        );
        if (matched) {
          selectedAddressId.value = matched.id;
        }
      }
    }
  } catch (error) {
    console.error("加载收货地址失败:", error);
    message("加载收货地址失败", { type: "error" });
  } finally {
    loading.value = false;
  }
};

// 选择地址
const handleSelect = (address: ReceiptAddress) => {
  if (address.id) {
    selectedAddressId.value = address.id;
  }
  emit("select", address);
};

// 格式化地址显示
const formatAddress = (address: ReceiptAddress) => {
  return `${address.receiverProvinceName || ""}${address.receiverCityName || ""}${address.receiverDistrictName || ""} ${address.receiverAddress || ""}`;
};

onMounted(() => {
  loadAddressList();
});
</script>

<template>
  <div class="address-selector">
    <div v-loading="loading" class="address-list">
      <div v-if="addressList.length === 0 && !loading" class="empty-tip">
        <el-empty description="暂无收货地址" />
      </div>
      <div
        v-for="address in addressList"
        :key="address.id"
        :class="['address-item', { active: selectedAddressId === address.id }]"
        @click="handleSelect(address)"
      >
        <div class="address-header">
          <span class="receiver-name">{{ address.receiverName }}</span>
          <span class="receiver-phone">{{ address.receiverPhone }}</span>
        </div>
        <div class="address-content">
          <span class="address-text">{{ formatAddress(address) }}</span>
        </div>
        <div v-if="selectedAddressId === address.id" class="selected-icon">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.address-selector {
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  position: relative;
  padding: 16px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}

.address-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 8px;

  .receiver-name {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .receiver-phone {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}

.address-content {
  .address-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }
}

.selected-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 20px;
  color: var(--el-color-primary);
}

.empty-tip {
  padding: 40px 0;
  text-align: center;
}
</style>
