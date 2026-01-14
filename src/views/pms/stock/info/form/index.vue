<script setup lang="ts">
import { ref, watch, computed } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/stock/info/utils/rule";
import { FormProps } from "@/views/pms/stock/info/utils/types";
import { getSkuListByProductId } from "@/api/pms";
import dayjs from "dayjs";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    productId: 0,
    skuId: 0,
    productName: "",
    skuName: "",
    quantity: 0,
    remark: "",
    createTime: "",
    operatorName: "",
    readOnly: false
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const isViewMode = computed(() => newFormInline.value.readOnly === true);

// SKU 选项列表
const skuOptions = ref<Array<{ label: string; value: number }>>([]);
const skuLoading = ref(false);

// 监听商品变化，加载 SKU 列表（仅在编辑模式下）
watch(
  () => newFormInline.value.productId,
  async productId => {
    // 查看模式下不需要加载 SKU 列表
    if (isViewMode.value) {
      return;
    }
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
    // 格式化时间显示
    if (newVal.createTime) {
      // 如果已经是格式化后的字符串，直接使用；否则格式化
      if (typeof newVal.createTime === "string") {
        newFormInline.value.createTime = newVal.createTime;
      } else {
        newFormInline.value.createTime = dayjs(newVal.createTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      }
    }
    // 如果有 productId，加载对应的 SKU 列表（仅在编辑模式下）
    if (!newVal.readOnly && newVal.productId && newVal.productId > 0) {
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
          <!-- 查看模式：使用普通文本输入框 -->
          <el-input
            v-if="isViewMode"
            v-model="newFormInline.skuName"
            placeholder="SKU名称"
            readonly
          />
          <!-- 编辑模式：使用下拉框 -->
          <el-select
            v-else
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
          <!-- 查看模式：使用普通文本输入框 -->
          <el-input
            v-if="isViewMode"
            v-model="newFormInline.quantity"
            placeholder="数量"
            readonly
          />
          <!-- 编辑模式：使用数值输入框 -->
          <el-input-number
            v-else
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
            :readonly="isViewMode"
          />
        </el-form-item>
      </re-col>

      <!-- 详情模式下显示入库时间和操作人 -->
      <template v-if="isViewMode">
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="入库时间">
            <el-input
              v-model="newFormInline.createTime"
              placeholder="入库时间"
              readonly
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="操作人">
            <el-input
              v-model="newFormInline.operatorName"
              placeholder="操作人名称"
              readonly
            />
          </el-form-item>
        </re-col>
      </template>
    </el-row>
  </el-form>
</template>
