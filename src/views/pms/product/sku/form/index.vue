<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/product/sku/utils/rule";
import { FormProps } from "@/views/pms/product/sku/utils/types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import {
  addAttr,
  deleteAttr,
  getAttrListByRelatedId,
  getAttrPage
} from "@/api/pms";

interface ExtendedFormItemProps {
  id?: number;
  title: string;
  productId?: number;
  skuCode?: string;
  skuName?: string;
  priceFee?: number;
  marketPriceFee?: number;
  status?: number;
  albumPics?: string;
  productOptions?: any[];
}

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () =>
    ({
      title: "新增",
      id: 0,
      productId: null,
      skuCode: "",
      skuName: "",
      priceFee: 0,
      marketPriceFee: 0,
      status: 1,
      albumPics: "",
      productOptions: []
    }) as ExtendedFormItemProps
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline as ExtendedFormItemProps);

// 商品选项
const productOptions = ref([]);

// SKU属性列表（包含商品属性和SKU属性）
const skuAttrs = ref<
  Array<{
    id?: number;
    attrName: string;
    attrValue: string;
    attrDesc?: string;
    attrType?: number; // 0: 商品属性（只读），1: SKU属性（可删除）
    isProductAttr?: boolean; // 是否为商品属性
  }>
>([]);

// 新增属性表单
const newAttrForm = ref({
  attrName: "",
  attrValue: "",
  attrDesc: ""
});

// 预设属性列表（根据商品ID查询）
const presetAttrs = ref<
  Array<{ id: number; attrName: string; attrValue: string; attrDesc?: string }>
>([]);
const showPresetDialog = ref(false);
const presetAttrLoading = ref(false);

// 监听formInline变化
watch(
  () => props.formInline,
  newVal => {
    const extendedVal = newVal as ExtendedFormItemProps;
    newFormInline.value = { ...extendedVal };
    // 价格从分转换为元（用于显示）
    if (extendedVal.priceFee) {
      newFormInline.value.priceFee = extendedVal.priceFee / 100;
    }
    if (extendedVal.marketPriceFee) {
      newFormInline.value.marketPriceFee = extendedVal.marketPriceFee / 100;
    }
    if (extendedVal.productOptions) {
      productOptions.value = extendedVal.productOptions;
    }
    // 如果是编辑模式，加载该SKU的属性
    if (extendedVal.id && extendedVal.id > 0) {
      // 延迟加载，确保组件已渲染
      setTimeout(() => {
        // 如果已选择商品，先加载商品属性
        if (extendedVal.productId) {
          loadProductAttrs(extendedVal.productId).then(() => {
            // 商品属性加载完成后再加载SKU属性
            loadSkuAttrs(extendedVal.id);
          });
        } else {
          // 如果没有商品ID，只加载SKU属性
          loadSkuAttrs(extendedVal.id);
        }
      }, 100);
    } else {
      skuAttrs.value = [];
      // 如果是新增模式且已选择商品，加载商品属性
      if (extendedVal.productId) {
        setTimeout(() => {
          loadProductAttrs(extendedVal.productId);
        }, 100);
      }
    }
  },
  { deep: true, immediate: true }
);

// 监听商品ID变化，加载商品属性和预设属性
watch(
  () => newFormInline.value.productId,
  productId => {
    if (productId) {
      loadProductAttrs(productId);
      loadPresetAttrs(productId);
    } else {
      presetAttrs.value = [];
      // 清空商品属性，只保留SKU属性
      skuAttrs.value = skuAttrs.value.filter(attr => attr.attrType === 1);
    }
  }
);

// 加载商品属性（attrType=0）
function loadProductAttrs(productId: number): Promise<void> {
  return getAttrPage({
    size: 1000,
    current: 1,
    filter: { relatedId: productId, attrType: 0 }
  }).then(res => {
    if (res.code === 200) {
      const productAttrs = (res.data.items || []).map((attr: any) => ({
        id: attr.id,
        attrName: attr.attrName,
        attrValue: attr.attrValue,
        attrDesc: attr.attrDesc,
        attrType: 0,
        isProductAttr: true
      }));

      // 移除之前的商品属性，添加新的商品属性
      skuAttrs.value = skuAttrs.value.filter(attr => attr.attrType === 1);
      skuAttrs.value = [...productAttrs, ...skuAttrs.value];
    }
  });
}

function getRef() {
  return ruleFormRef.value;
}

// 加载SKU的属性列表（只加载SKU属性，商品属性需要从商品ID加载）
function loadSkuAttrs(skuId: number) {
  getAttrListByRelatedId(skuId).then(res => {
    if (res.code === 200) {
      const allAttrs = res.data || [];
      // 只保留SKU属性（attrType=1），商品属性从商品ID加载
      const skuOnlyAttrs = allAttrs
        .filter((attr: any) => attr.attrType === 1)
        .map((attr: any) => ({
          ...attr,
          isProductAttr: false
        }));
      // 保留现有的商品属性，只更新SKU属性
      const existingProductAttrs = skuAttrs.value.filter(
        attr => attr.isProductAttr || attr.attrType === 0
      );
      skuAttrs.value = [...existingProductAttrs, ...skuOnlyAttrs];
    }
  });
}

// 加载商品的预设属性（根据商品ID查询）
function loadPresetAttrs(productId: number) {
  presetAttrLoading.value = true;
  getAttrPage({
    size: 1000,
    current: 1,
    filter: { relatedId: productId }
  }).then(res => {
    if (res.code === 200) {
      presetAttrs.value = res.data.items || [];
    }
    presetAttrLoading.value = false;
  });
}

// 新增属性
function handleAddAttr() {
  if (!newAttrForm.value.attrName || !newAttrForm.value.attrValue) {
    message("请填写属性名称和属性值", { type: "warning" });
    return;
  }

  // 如果是新增SKU，先添加到临时列表，等SKU保存后再提交
  if (!newFormInline.value.id || newFormInline.value.id === 0) {
    // 添加到临时列表（SKU属性）
    skuAttrs.value.push({
      attrName: newAttrForm.value.attrName,
      attrValue: newAttrForm.value.attrValue,
      attrDesc: newAttrForm.value.attrDesc,
      attrType: 1,
      isProductAttr: false
    });
    // 重置表单
    newAttrForm.value = {
      attrName: "",
      attrValue: "",
      attrDesc: ""
    };
    message("属性已添加到列表，保存SKU后将自动提交", { type: "success" });
    return;
  }

  // 编辑模式下，也先添加到临时列表，等保存SKU时一起提交
  // 这样可以避免在编辑过程中频繁请求接口
  skuAttrs.value.push({
    attrName: newAttrForm.value.attrName,
    attrValue: newAttrForm.value.attrValue,
    attrDesc: newAttrForm.value.attrDesc,
    attrType: 1,
    isProductAttr: false
  });
  // 重置表单
  newAttrForm.value = {
    attrName: "",
    attrValue: "",
    attrDesc: ""
  };
  message("属性已添加到列表，保存SKU后将自动提交", { type: "success" });
}

// 从预设属性中选择并添加
function handleSelectPresetAttr(attr: any) {
  // 检查是否已存在相同属性（包括商品属性和SKU属性）
  const exists = skuAttrs.value.some(
    a => a.attrName === attr.attrName && a.attrValue === attr.attrValue
  );
  if (exists) {
    message("该属性已存在", { type: "warning" });
    return;
  }

  // 统一添加到临时列表，等保存SKU时一起提交
  skuAttrs.value.push({
    attrName: attr.attrName,
    attrValue: attr.attrValue,
    attrDesc: attr.attrDesc,
    attrType: 1,
    isProductAttr: false
  });
  message("属性已添加到列表，保存SKU后将自动提交", { type: "success" });
  showPresetDialog.value = false;
}

// 删除属性
function handleDeleteAttr(attrId: number, index: number) {
  const attr = skuAttrs.value[index];
  // 商品属性不允许删除
  if (attr.isProductAttr || attr.attrType === 0) {
    message("商品属性不允许删除", { type: "warning" });
    return;
  }

  if (!attrId) {
    // 如果是未保存的属性，直接从列表中删除
    skuAttrs.value.splice(index, 1);
    return;
  }

  deleteAttr(attrId).then(res => {
    if (res.code === 200) {
      message("属性删除成功", { type: "success" });
      loadSkuAttrs(newFormInline.value.id);
    }
  });
}

// 打开预设属性对话框
function openPresetDialog() {
  if (!newFormInline.value.productId) {
    message("请先选择商品", { type: "warning" });
    return;
  }
  showPresetDialog.value = true;
  loadPresetAttrs(newFormInline.value.productId);
}

function getFormData() {
  // 价格从元转换为分（用于提交）
  const data = { ...newFormInline.value };
  if (data.priceFee) {
    data.priceFee = Math.round(data.priceFee * 100);
  }
  if (data.marketPriceFee) {
    data.marketPriceFee = Math.round(data.marketPriceFee * 100);
  }
  return data;
}

// 获取属性列表（用于父组件在保存SKU后调用）
function getAttrs() {
  return skuAttrs.value;
}

// 保存属性（在SKU保存后调用，传入SKU ID）
async function saveAttrs(skuId: number) {
  const tempAttrs = skuAttrs.value.filter(attr => !attr.id);
  if (tempAttrs.length === 0) {
    return;
  }

  const promises = tempAttrs
    .filter(attr => !attr.isProductAttr && attr.attrType !== 0) // 只保存SKU属性
    .map(attr => {
      const attrData = {
        relatedId: skuId,
        attrType: 1, // SKU属性
        attrName: attr.attrName,
        attrValue: attr.attrValue,
        attrDesc: attr.attrDesc || null
      };
      return addAttr(attrData);
    });

  try {
    await Promise.all(promises);
    message("属性保存成功", { type: "success" });
    // 重新加载属性列表
    loadSkuAttrs(skuId);
  } catch (error) {
    message("部分属性保存失败", { type: "error" });
  }
}

defineExpose({ getRef, getFormData, getAttrs, saveAttrs, loadSkuAttrs });
</script>

<template>
  <div>
    <el-form
      ref="ruleFormRef"
      :model="newFormInline"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="30">
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="商品" prop="productId">
            <el-select
              v-model="newFormInline.productId"
              placeholder="请选择商品"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in productOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="SKU编码" prop="skuCode">
            <el-input
              v-model="newFormInline.skuCode"
              clearable
              placeholder="请输入SKU编码"
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="SKU名称" prop="skuName">
            <el-input
              v-model="newFormInline.skuName"
              clearable
              placeholder="请输入SKU名称"
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="newFormInline.status"
              placeholder="请选择状态"
              style="width: 100%"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="市场价（元）" prop="marketPriceFee">
            <el-input-number
              v-model="newFormInline.marketPriceFee"
              :min="0"
              :precision="2"
              placeholder="请输入市场价"
              style="width: 100%"
            />
            <div style="margin-top: 5px; font-size: 12px; color: #909399">
              实际存储单位为分
            </div>
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="售价（元）" prop="priceFee">
            <el-input-number
              v-model="newFormInline.priceFee"
              :min="0"
              :precision="2"
              placeholder="请输入售价"
              style="width: 100%"
            />
            <div style="margin-top: 5px; font-size: 12px; color: #909399">
              实际存储单位为分
            </div>
          </el-form-item>
        </re-col>

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="商品图片" prop="albumPics">
            <el-input
              v-model="newFormInline.albumPics"
              placeholder="商品图片ID，限制为5张，以逗号分割"
              type="textarea"
              :rows="2"
            />
            <div style="margin-top: 5px; font-size: 12px; color: #909399">
              多张图片ID以逗号分割，例如：1,2,3
            </div>
          </el-form-item>
        </re-col>

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="SKU属性">
            <div style="width: 100%">
              <!-- 已添加的属性列表 -->
              <div v-if="skuAttrs.length > 0" style="margin-bottom: 15px">
                <div
                  v-for="(attr, index) in skuAttrs"
                  :key="attr.id || index"
                  style="
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    background: var(--el-fill-color-light);
                    border-radius: 4px;
                  "
                >
                  <el-tag
                    style="margin-right: 10px"
                    :type="
                      attr.isProductAttr || attr.attrType === 0
                        ? 'success'
                        : 'primary'
                    "
                  >
                    {{ attr.attrName }}
                    <span
                      v-if="attr.isProductAttr || attr.attrType === 0"
                      style="margin-left: 5px; font-size: 10px"
                    >
                      (商品)
                    </span>
                  </el-tag>
                  <span style="flex: 1; margin-right: 10px">{{
                    attr.attrValue
                  }}</span>
                  <el-button
                    v-if="!(attr.isProductAttr || attr.attrType === 0)"
                    type="danger"
                    size="small"
                    :icon="useRenderIcon('ep:delete')"
                    @click="handleDeleteAttr(attr.id, index)"
                  >
                    删除
                  </el-button>
                  <span
                    v-else
                    style=" padding: 0 8px; font-size: 12px;color: #909399"
                  >
                    商品属性（不可删除）
                  </span>
                </div>
              </div>

              <!-- 新增属性表单 -->
              <el-card shadow="never" style="margin-bottom: 15px">
                <template #header>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                  >
                    <span>新增属性</span>
                    <el-button
                      type="primary"
                      size="small"
                      :icon="useRenderIcon('ri:list-check')"
                      @click="openPresetDialog"
                    >
                      选择预设属性
                    </el-button>
                  </div>
                </template>
                <el-row :gutter="15">
                  <el-col :span="8">
                    <el-input
                      v-model="newAttrForm.attrName"
                      placeholder="属性名称（如：颜色）"
                      clearable
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-input
                      v-model="newAttrForm.attrValue"
                      placeholder="属性值（如：黑色）"
                      clearable
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-button
                      type="primary"
                      :icon="useRenderIcon('ri:add-line')"
                      style="width: 100%"
                      @click="handleAddAttr"
                    >
                      添加
                    </el-button>
                  </el-col>
                </el-row>
                <el-input
                  v-model="newAttrForm.attrDesc"
                  placeholder="属性描述（可选）"
                  style="margin-top: 10px"
                  clearable
                />
                <div style="margin-top: 5px; font-size: 12px; color: #909399">
                  提示：新增SKU时，可以先添加属性到列表，保存SKU后会自动提交属性
                </div>
              </el-card>
            </div>
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>

    <!-- 预设属性选择对话框 -->
    <el-dialog v-model="showPresetDialog" title="选择预设属性" width="60%">
      <div v-loading="presetAttrLoading">
        <div
          v-if="presetAttrs.length === 0"
          style="padding: 40px; color: #909399; text-align: center"
        >
          该商品暂无预设属性
        </div>
        <div v-else>
          <div
            v-for="attr in presetAttrs"
            :key="attr.id"
            style="
              display: flex;
              align-items: center;
              padding: 12px;
              margin-bottom: 10px;
              cursor: pointer;
              border: 1px solid var(--el-border-color);
              border-radius: 4px;
              transition: all 0.3s;
            "
            @click="handleSelectPresetAttr(attr)"
            @mouseenter="
              (e: any) =>
                (e.currentTarget.style.borderColor = 'var(--el-color-primary)')
            "
            @mouseleave="
              (e: any) =>
                (e.currentTarget.style.borderColor = 'var(--el-border-color)')
            "
          >
            <el-tag style="margin-right: 15px" type="primary">
              {{ attr.attrName }}
            </el-tag>
            <span style="flex: 1; margin-right: 15px">{{
              attr.attrValue
            }}</span>
            <span
              v-if="attr.attrDesc"
              style="margin-right: 15px; font-size: 12px; color: #909399"
            >
              {{ attr.attrDesc }}
            </span>
            <el-button
              type="primary"
              size="small"
              :icon="useRenderIcon('ri:add-line')"
            >
              添加
            </el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showPresetDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
