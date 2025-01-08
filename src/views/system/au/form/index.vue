<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/system/au/utils/rule";
import { FormProps } from "@/views/system/au/utils/types";
import { useColumns } from "@/views/system/au/buy-record/columns";
import Segmented, { type OptionsType } from "@/components/ReSegmented";

const selectRef = ref();
const { columns, pagination, selectValue, dataList, rowStyle, onRowClick } =
  useColumns(selectRef);

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    transactionType: 0,
    price: 0,
    quantity: 0,
    relationId: "",
    transactionTime: "",
    profitAmount: 0
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });

watch(selectValue, newVal => {
  newFormInline.value.relationId = newVal;
});

const transactionTypeOptions: Array<OptionsType> = [
  {
    label: "买入",
    value: 0
  },
  {
    label: "卖出",
    value: 1
  }
];
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col
        :value="newFormInline.transactionType === 1 ? 12 : 24"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="交易类型" prop="transactionType">
          <Segmented
            v-model="newFormInline.transactionType"
            :disabled="newFormInline.title === '详情'"
            :options="transactionTypeOptions"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="newFormInline.transactionType === 1"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="关联交易" prop="relationId">
          <el-select
            ref="selectRef"
            v-model="newFormInline.relationId"
            :disabled="newFormInline.title === '详情'"
            class="!w-full"
            placeholder="请选择"
            value-key="id"
            clearable
          >
            <template #empty>
              <div class="m-4">
                <pure-table
                  row-key="id"
                  alignWhole="center"
                  :header-cell-style="{
                    background: 'var(--el-fill-color-light)',
                    color: 'var(--el-text-color-primary)'
                  }"
                  :row-style="rowStyle"
                  :data="
                    dataList.slice(
                      (pagination.currentPage - 1) * pagination.pageSize,
                      pagination.currentPage * pagination.pageSize
                    )
                  "
                  :columns="columns"
                  :pagination="pagination"
                  @row-click="onRowClick"
                />
              </div>
            </template>
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="交易数量" prop="quantity">
          <el-input-number
            v-model="newFormInline.quantity"
            :readonly="newFormInline.title === '详情'"
            class="!w-full"
            :min="1"
            :max="100"
            controls-position="right"
          >
            <template #append>克</template>
          </el-input-number>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="交易价格" prop="price">
          <el-input
            v-model="newFormInline.price"
            :readonly="newFormInline.title === '详情'"
            clearable
            placeholder="请输入交易价格"
          >
            <template #append>元/克</template>
          </el-input>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="交易总价" prop="priceTotal">
          <el-input
            :model-value="newFormInline.price * newFormInline.quantity"
            readonly
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>
      </re-col>

      <re-col
        v-if="
          newFormInline.title === '详情' && newFormInline.transactionType === 1
        "
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="买入价格" prop="purchasePrice">
          <el-input
            :model-value="
              (
                newFormInline.price -
                2.5 -
                newFormInline.profitAmount / newFormInline.quantity
              ).toFixed(2)
            "
            readonly
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="交易时间" prop="transactionTime">
          <el-date-picker
            v-model="newFormInline.transactionTime"
            :readonly="newFormInline.title === '详情'"
            class="!w-full"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择交易时间"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="
          newFormInline.title === '详情' && newFormInline.transactionType === 1
        "
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="盈利金额" prop="profitAmount">
          <el-input v-model="newFormInline.profitAmount" readonly>
            <template #append>元</template>
          </el-input>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
