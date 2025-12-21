<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import VuePdfEmbed from "vue-pdf-embed";
import { filePreviewUrl } from "@/api/system";
import { baseUrlApi } from "@/api/utils";
import { getToken, formatToken } from "@/utils/auth";
import axios from "axios";

defineOptions({
  name: "FilePreview"
});

interface Props {
  fileId: string | number;
  fileName: string;
  fileType: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
const pdfRef = ref<any>();
const pageCount = ref(1);
const loading = ref(true);
const currentPage = ref(1);
const currentRotation = ref(0);
const showAllPages = ref(false);
const rotations = [0, 90, 180, 270];
const previewUrl = ref("");
const isImage = ref(false);
const isPdf = ref(false);

// 判断文件类型
const checkFileType = () => {
  const type = props.fileType.toLowerCase();
  isImage.value = type.startsWith("image/");
  isPdf.value =
    type === "application/pdf" || props.fileName.toLowerCase().endsWith(".pdf");
};

// 获取预览 URL
const getPreviewUrl = async () => {
  try {
    loading.value = true;
    const token = getToken();
    // 使用 filePreviewUrl 接口获取预览地址
    // 由于接口返回的是 Result 类型，我们需要直接请求文件流
    const url = baseUrlApi(`/sys/file/preview/${props.fileId}`);
    const response = await axios.get(url, {
      headers: {
        Authorization: token ? formatToken(token.accessToken) : ""
      },
      responseType: "blob"
    });

    // 如果是图片或 PDF，创建 blob URL
    if (isImage.value || isPdf.value) {
      const blob = new Blob([response.data], { type: props.fileType });
      previewUrl.value = URL.createObjectURL(blob);
    } else {
      // 其他文件类型，可能需要特殊处理
      previewUrl.value = url;
    }
  } catch (error) {
    console.error("获取预览地址失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleDocumentRender = () => {
  loading.value = false;
  if (pdfRef.value?.doc) {
    pageCount.value = pdfRef.value.doc.numPages;
  }
};

const showAllPagesChange = () => {
  currentPage.value = showAllPages.value ? null : 1;
};

const onPrint = () => {
  if (pdfRef.value) {
    pdfRef.value.print();
  }
};

watch(
  () => props.fileId,
  () => {
    checkFileType();
    getPreviewUrl();
  },
  { immediate: true }
);
</script>

<template>
  <div v-loading="loading" :element-loading-text="t('status.pureLoad')">
    <!-- PDF 预览 -->
    <div v-if="isPdf && previewUrl" class="h-[calc(100vh-295px)]">
      <div class="flex justify-between items-center h-9">
        <div v-if="showAllPages" class="font-medium ml-1.25 text-xl">
          共{{ pageCount }}页
        </div>
        <div v-else>
          <el-pagination
            v-model:current-page="currentPage"
            background
            layout="prev, slot, next"
            :page-size="1"
            :total="pageCount"
          >
            {{ currentPage }} / {{ pageCount }}
          </el-pagination>
        </div>
        <div class="w-[170px] flex-bc">
          <el-checkbox v-model="showAllPages" @change="showAllPagesChange">
            显示所有页面
          </el-checkbox>
          <IconifyIconOnline
            v-tippy="{
              maxWidth: 'none',
              content: `翻转（当前角度${rotations[currentRotation]}度）`
            }"
            icon="ic:baseline-rotate-90-degrees-ccw"
            class="cursor-pointer outline-transparent"
            @click="
              currentRotation === 3
                ? (currentRotation = 0)
                : (currentRotation += 1)
            "
          />
          <IconifyIconOnline
            v-tippy="{
              maxWidth: 'none',
              content: '打印'
            }"
            icon="ri:printer-line"
            class="cursor-pointer outline-transparent"
            @click="onPrint"
          />
        </div>
      </div>
      <el-scrollbar>
        <vue-pdf-embed
          ref="pdfRef"
          class="h-full container overflow-auto"
          :rotation="rotations[currentRotation]"
          :page="currentPage"
          :source="previewUrl"
          @rendered="handleDocumentRender"
        />
      </el-scrollbar>
    </div>

    <!-- 图片预览 -->
    <div v-else-if="isImage && previewUrl" class="h-[calc(100vh-295px)]">
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

    <!-- 不支持预览的文件类型 -->
    <div v-else class="flex justify-center items-center h-[calc(100vh-295px)]">
      <el-empty description="该文件类型不支持预览" />
    </div>
  </div>
</template>
