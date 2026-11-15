<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { baseUrlApi } from "@/api/utils";
import { getToken } from "@/utils/auth";

defineOptions({
  name: "FilePreview"
});

interface Props {
  fileId: string | number;
  fileName: string;
  fileType: string;
}

const props = defineProps<Props>();

const isImage = ref(false);
const isPdf = ref(false);

const previewUrl = computed(() => {
  const token = getToken();
  const accessToken = token?.accessToken || "";
  return (
    baseUrlApi(`/sys/file/preview/${props.fileId}`) +
    (accessToken ? `?token=${accessToken}` : "")
  );
});

const checkFileType = () => {
  const type = (props.fileType || "").toLowerCase();
  const name = (props.fileName || "").toLowerCase();
  isImage.value =
    type.startsWith("image/") ||
    type.includes("image") ||
    /\.(png|jpe?g|gif|bmp|webp|svg)$/.test(name);
  isPdf.value =
    type === "application/pdf" || type.includes("pdf") || name.endsWith(".pdf");
};

watch(
  () => props.fileId,
  () => {
    checkFileType();
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div v-if="isPdf" class="h-[calc(100vh-295px)]">
      <iframe
        :src="previewUrl"
        class="w-full h-full border-0"
        title="文件预览"
      />
    </div>
    <div v-else-if="isImage" class="h-[calc(100vh-295px)]">
      <el-scrollbar>
        <div class="flex justify-center items-center h-full">
          <el-image
            :src="previewUrl"
            :preview-src-list="[previewUrl]"
            fit="contain"
            class="max-w-full max-h-full"
            preview-teleported
            loading="lazy"
          />
        </div>
      </el-scrollbar>
    </div>
    <div v-else class="flex justify-center items-center h-[calc(100vh-295px)]">
      <el-empty description="该文件类型不支持预览" />
    </div>
  </div>
</template>
