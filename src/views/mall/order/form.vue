<script setup lang="ts">
import { ref } from "vue";
import { Order } from "./utils/types";

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
    receiverRegion: "",
    receiverAddress: "",
    email: ""
  })
});

// vue 规定所有的 prop 都遵循着单向绑定原则，直接修改 prop 时，Vue 会抛出警告。此处的写法仅仅是为了消除警告。
// 因为对一个 reactive 对象执行 ref，返回 Ref 对象的 value 值仍为传入的 reactive 对象，
// 即 newFormInline === props.formInline 为 true，所以此处代码的实际效果，仍是直接修改 props.formInline。
// 但该写法仅适用于 props.formInline 是一个对象类型的情况，原始类型需抛出事件
// 推荐阅读：https://cn.vuejs.org/guide/components/props.html#one-way-data-flow
const newFormInline = ref(props.formInline);
</script>

<template>
  <el-descriptions :column="3" label-width="250px" border>
    <el-descriptions-item label="订单编号:"
      >{{ newFormInline.orderCode }}
    </el-descriptions-item>
    <el-descriptions-item label="订单状态:">
      <el-tag v-if="newFormInline.orderStatus === 0" size="small" type="warning"
        >待付款
      </el-tag>
      <el-tag v-if="newFormInline.orderStatus === 1" size="small" type="warning"
        >待发货
      </el-tag>
      <el-tag v-if="newFormInline.orderStatus === 2" size="small"
        >已发货</el-tag
      >
      <el-tag v-if="newFormInline.orderStatus === 3" size="small" type="danger"
        >待收货
      </el-tag>
      <el-tag v-if="newFormInline.orderStatus === 4" size="small" type="success"
        >已完成
      </el-tag>
      <el-tag v-if="newFormInline.orderStatus === 5" size="small" type="success"
        >已关闭
      </el-tag>
      <el-tag v-if="newFormInline.orderStatus === 6" size="small" type="info"
        >无效订单
      </el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="订单类型:">
      <el-tag v-if="newFormInline.orderType === 1" size="small" type="success"
        >秒杀订单
      </el-tag>
      <el-tag v-else size="small">正常订单</el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="支付方式:">
      <el-tag v-if="newFormInline.payType === 0" size="small" type="warning"
        >待支付
      </el-tag>
      <el-tag v-if="newFormInline.payType === 1" size="small">支付宝 </el-tag>
      <el-tag v-if="newFormInline.payType === 2" size="small" type="success"
        >微信</el-tag
      >
    </el-descriptions-item>
    <el-descriptions-item label="收货状态:">
      <el-tag
        v-if="newFormInline.confirmStatus === 1"
        size="small"
        type="success"
        >已收货
      </el-tag>
      <el-tag v-else size="small">未收货</el-tag>
    </el-descriptions-item>
    <el-descriptions-item
      v-if="newFormInline.confirmStatus === 1"
      label="收货时间:"
    >
      {{ newFormInline.receiveTime }}
    </el-descriptions-item>
    <el-descriptions-item label="收货人:"
      >{{ newFormInline.receiverName }}
    </el-descriptions-item>
    <el-descriptions-item label="收货手机:"
      >{{ newFormInline.receiverPhone }}
    </el-descriptions-item>
    <el-descriptions-item :span="2" label="通知邮箱:"
      >{{ newFormInline.email }}
    </el-descriptions-item>
    <el-descriptions-item :span="3" label="收货地址:"
      >{{ newFormInline.receiverAddress }}
    </el-descriptions-item>
    <el-descriptions-item :span="3" label="订单备注:"
      >{{ newFormInline.note }}
    </el-descriptions-item>
    <el-descriptions-item :span="3" label="实付款:"
      >共减￥XXX.XX 合计￥XXX.XX
    </el-descriptions-item>
  </el-descriptions>

  <div class="flex flex-wrap gap-4" style="margin-top: 20px">
    <el-card
      v-for="product in newFormInline.products"
      :key="product.id"
      style="width: 100%"
      shadow="hover"
    >
      <div style="float: left; width: 120px; height: 120px">
        <el-image
          style="width: 100px; height: 100px"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
      </div>
      <div>
        商品: {{ product.productId }} 数量: {{ product.productQuantity }} SKU:
        XXX 原价: ￥{{ product.price }} 到手价: ￥{{ product.realAmount }} 共减:
        ￥
        {{ product.discountAmount }}
      </div>
    </el-card>
  </div>
</template>
