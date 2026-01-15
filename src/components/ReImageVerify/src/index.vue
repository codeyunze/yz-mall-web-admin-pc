<script setup lang="ts">
import { watch } from "vue";
import { useImageVerify } from "./hooks";

defineOptions({
  name: "ReImageVerify"
});

interface Props {
  code?: string;
}

interface Emits {
  (e: "update:code", code: string): void;
  (e: "update:captchaId", captchaId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  code: ""
});

const emit = defineEmits<Emits>();

const { imgRef, imgCode, captchaId, imageSrc, setImgCode, getImgCode } =
  useImageVerify();

watch(
  () => props.code,
  newValue => {
    setImgCode(newValue);
  }
);
watch(imgCode, newValue => {
  emit("update:code", newValue);
});
watch(captchaId, newValue => {
  emit("update:captchaId", newValue);
});

function handleImageError() {
  console.error("验证码图片加载失败，尝试重新获取");
  getImgCode();
}

defineExpose({ getImgCode, captchaId });
</script>

<template>
  <div
    class="captcha-container"
    style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 40px;
    "
  >
    <img
      v-if="imageSrc"
      ref="imgRef"
      :src="imageSrc"
      width="120"
      height="40"
      class="cursor-pointer"
      alt="验证码"
      style="display: block"
      @click="getImgCode"
      @error="handleImageError"
    />
    <span v-else style="font-size: 12px; color: #999">加载中...</span>
  </div>
</template>
