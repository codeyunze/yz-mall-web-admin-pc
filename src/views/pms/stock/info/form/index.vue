<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/stock/info/utils/rule";
import { FormProps } from "@/views/pms/stock/info/utils/types";
import { getSkuListByProductId } from "@/api/pms";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    productId: 0,
    skuId: 0,
    productName: "",
    skuName: "",
    quantity: 0,
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

// SKU 选项列表
const skuOptions = ref<Array<{ label: string; value: number }>>([]);
const skuLoading = ref(false);

// 监听商品变化，加载 SKU 列表
watch(
  () => newFormInline.value.productId,
  async productId => {
    if (productId && productId > 0) {
      skuLoading.value = true;
      skuOptions.value = [];
      newFormInline.value.skuId = 0;
      try {
        const res = await getSkuListByProductId(productId);
        if (res.code === 200 && res.data) {
          skuOptions.value = (res.data || []).map((sku: any) => ({
            label: `${sku.skuName || sku.skuCode} (${sku.skuCode})`,
            value: sku.id
          }));
        }
      } catch (error) {
        console.error("加载SKU列表失败:", error);
      } finally {
        skuLoading.value = false;
      }
    } else {
      skuOptions.value = [];
      newFormInline.value.skuId = 0;
    }
  }
);

// 监听 formInline 变化
watch(
  () => props.formInline,
  newVal => {
    newFormInline.value = { ...newVal };
    // 如果有 productId，加载对应的 SKU 列表
    if (newVal.productId && newVal.productId > 0) {
      getSkuListByProductId(newVal.productId).then(res => {
        if (res.code === 200 && res.data) {
          skuOptions.value = (res.data || []).map((sku: any) => ({
            label: `${sku.skuName || sku.skuCode} (${sku.skuCode})`,
            value: sku.id
          }));
        }
      });
    }
  },
  { deep: true, immediate: true }
);

function getRef() {
  return ruleFormRef.value;
}

function getFormData() {
  return newFormInline.value;
}

defineExpose({ getRef, getFormData });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="商品" prop="productName">
          <el-input
            v-model="newFormInline.productName"
            placeholder="请选择商品"
            readonly
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="SKU" prop="skuId">
          <el-select
            v-model="newFormInline.skuId"
            placeholder="请选择SKU"
            class="!w-full"
            :loading="skuLoading"
            :disabled="
              !newFormInline.productId || newFormInline.productId === 0
            "
            clearable
          >
            <el-option
              v-for="option in skuOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="newFormInline.quantity"
            class="!w-full"
            :min="1"
            controls-position="right"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="商品备注">
          <el-input
            v-model="newFormInline.remark"
            placeholder="请输入说明信息"
            type="textarea"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
