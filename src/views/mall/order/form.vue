<script setup lang="ts">
import { onMounted, ref } from "vue";
import { OmsOrderDetail } from "@/api/oms";

// 声明 props 类型
export interface FormProps {
  formInline: OmsOrderDetail;
}

// 声明 props 默认值
// 推荐阅读：https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props
const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    /**
     * 订单主键标识
     */
    id: 0,
    /**
     * 订单编号;省市区年月日000001
     */
    orderCode: 0,
    /**
     * 订单状态：0待付款；1待发货；2已发货；3待收货；4已完成；5已关闭/已取消/已取消；6无效订单
     */
    orderStatus: 0,
    /**
     * 订单类型：0正常订单；1秒杀订单
     */
    orderType: 0,
    /**
     * 订单总金额
     */
    totalAmount: 0,
    /**
     * 优惠金额
     */
    discountAmount: 0,
    /**
     * 订单实际应付金额
     */
    payAmount: 0,
    /**
     * 收货人姓名
     */
    receiverName: "",
    /**
     * 收货人手机号
     */
    receiverPhone: "",
    /**
     * 收货省
     */
    receiverProvince: "",
    /**
     * 收货市
     */
    receiverCity: "",
    /**
     * 收货区
     */
    receiverDistrict: "",
    /**
     * 收货详细地址
     */
    receiverAddress: "",
    /**
     * 订单消息接收邮箱
     */
    email: "",
    /**
     * 订单创建时间
     */
    createTime: "",
    /**
     * 确认收货时间
     */
    receiveTime: "",
    /**
     * 支付方式：0未支付/待支付；1支付宝；2微信
     */
    payType: 0,
    /**
     * 收货状态：0未确认收货；1已确认收货
     */
    confirmStatus: 0,
    /**
     * 订单备注
     */
    note: "",
    /**
     * 订单商品
     */
    products: []
  })
});

// vue 规定所有的 prop 都遵循着单向绑定原则，直接修改 prop 时，Vue 会抛出警告。此处的写法仅仅是为了消除警告。
// 因为对一个 reactive 对象执行 ref，返回 Ref 对象的 value 值仍为传入的 reactive 对象，
// 即 newFormInline === props.formInline 为 true，所以此处代码的实际效果，仍是直接修改 props.formInline。
// 但该写法仅适用于 props.formInline 是一个对象类型的情况，原始类型需抛出事件
// 推荐阅读：https://cn.vuejs.org/guide/components/props.html#one-way-data-flow
const newFormInline = ref(props.formInline);
// 合计
const totalPrice = ref(0.0);

onMounted(() => {
  console.log("加载数据", newFormInline);
  newFormInline.value.products.forEach(product => {
    totalPrice.value =
      totalPrice.value + product.productPrice * product.productQuantity;
  });
});
</script>

<template>
  <div>
    <el-descriptions :column="3" label-width="200px" border>
      <el-descriptions-item label="订单编号:"
        >{{ newFormInline.orderCode }}
      </el-descriptions-item>
      <el-descriptions-item label="订单类型:">
        <el-tag v-if="newFormInline.orderType === 1" size="small" type="success"
          >秒杀订单
        </el-tag>
        <el-tag v-else size="small">正常订单</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="订单状态:">
        <el-tag
          v-if="newFormInline.orderStatus === 0"
          size="small"
          type="warning"
          >待付款
        </el-tag>
        <el-tag
          v-if="newFormInline.orderStatus === 1"
          size="small"
          type="warning"
          >待发货
        </el-tag>
        <el-tag v-if="newFormInline.orderStatus === 2" size="small"
          >已发货
        </el-tag>
        <el-tag
          v-if="newFormInline.orderStatus === 3"
          size="small"
          type="danger"
          >待收货
        </el-tag>
        <el-tag
          v-if="newFormInline.orderStatus === 4"
          size="small"
          type="success"
          >已完成
        </el-tag>
        <el-tag
          v-if="newFormInline.orderStatus === 5"
          size="small"
          type="success"
          >已取消
        </el-tag>
        <el-tag v-if="newFormInline.orderStatus === 6" size="small" type="info"
          >无效订单
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="支付方式:">
        <el-tag v-if="newFormInline.payType === 0" size="small" type="warning"
          >待支付
        </el-tag>
        <el-tag v-if="newFormInline.payType === 1" size="small">支付宝</el-tag>
        <el-tag v-if="newFormInline.payType === 2" size="small" type="success"
          >微信
        </el-tag>
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
    </el-descriptions>

    <div class="flex flex-wrap gap-4" style="margin-top: 20px">
      <el-card
        v-for="product in newFormInline.products"
        :key="product.id"
        style="width: 100%"
        shadow="hover"
      >
        <el-row>
          <el-col :span="4">
            <el-image
              style="width: 100px; height: 100px"
              src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            />
          </el-col>
          <el-col :span="20">
            <el-row>
              <el-col :span="16" class="colProduct"
                >商品: {{ product.productName }}
              </el-col>
              <el-col :span="8" class="colProduct"
                >原价: ￥ {{ product.productPrice }}
              </el-col>
              <el-col :span="16" class="colProduct">SKU: XXX </el-col>
              <el-col :span="8" class="colProduct"
                >到手价: ￥ {{ product.realAmount }}
              </el-col>
              <el-col :span="8" class="colProduct"
                >数量: {{ product.productQuantity }}
              </el-col>
              <el-col :span="8" class="colProduct"
                >共减: ￥ {{ product.discountAmount }}
              </el-col>
              <el-col :span="8" class="colProduct"
                >合计: ￥
                {{ product.productPrice * product.productQuantity }}
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <div style="float: right; margin-top: 20px">
      合计
      <el-text type="danger" size="large" style="font-size: 24px"
        >￥{{ totalPrice }}
      </el-text>
    </div>
  </div>
</template>

<style scoped>
.colProduct {
  height: 40px;
  line-height: 40px;
}
</style>
