import { ref, onMounted, onUnmounted } from "vue";
import { getCaptcha } from "@/api/user";

/** 图形验证码自动刷新间隔（毫秒） */
const CAPTCHA_REFRESH_INTERVAL_MS = 60_000;

/**
 * 从后端获取图形验证码
 */
export const useImageVerify = () => {
  const imgRef = ref<HTMLImageElement>();
  const imgCode = ref("");
  const captchaId = ref("");
  const imageSrc = ref("");
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  function setImgCode(code: string) {
    imgCode.value = code;
  }

  async function getImgCode() {
    try {
      imageSrc.value = ""; // 清空图片，显示加载状态
      const res = await getCaptcha();

      // 检查响应格式
      if (!res) {
        console.error("验证码接口返回为空");
        return;
      }

      // 检查响应码和数据
      if (res.code === 200 && res.data) {
        if (res.data.captchaId && res.data.image) {
          captchaId.value = res.data.captchaId;
          imageSrc.value = res.data.image;
          imgCode.value = ""; // 清空验证码，等待用户输入
        } else {
          console.error("验证码数据不完整:", res.data);
        }
      } else {
        console.error(
          "验证码接口返回错误, code:",
          res.code,
          "msg:",
          res.msg,
          "data:",
          res.data
        );
      }
    } catch (error: any) {
      console.error("获取验证码失败:", error);
      if (error?.response) {
        console.error("响应错误:", error.response.data);
      }
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    refreshTimer = setInterval(() => {
      getImgCode();
    }, CAPTCHA_REFRESH_INTERVAL_MS);
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

  onMounted(() => {
    getImgCode();
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    imgRef,
    imgCode,
    captchaId,
    imageSrc,
    setImgCode,
    getImgCode
  };
};
