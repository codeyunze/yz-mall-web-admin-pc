<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/product/info/utils/rule";
import { FormProps } from "@/views/pms/product/info/utils/types";
import { Plus } from "@element-plus/icons-vue";
import type { UploadProps, UploadUserFile } from "element-plus";
import { formatToken, getToken } from "@/utils/auth";
import { filePublicPreviewUrl, fileUploadUrl } from "@/api/system";
import type { ImageInstance } from "element-plus";
import { message } from "@/utils/message";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    productName: "",
    productPrice: 0,
    remark: "",
    titles: "",
    publishStatus: 0,
    verifyStatus: 1,
    albumPics: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const imageRef = ref<ImageInstance>();
// 预览图片列表
const previewFilesUrl = ref([]);
// 选中预览图片地址
const previewSelectedFileUrl = ref("");
// 选中预览图片在图片列表里的索引下标
const previewSelectedFileIndex = ref(0);
// 照片墙展示图片
const photoWallUrl = ref<UploadUserFile[]>([]);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });

function getRequestAddress() {
  return window.location.href.substring(0, window.location.href.indexOf("/#"));
}

const getFileList = () => {
  if (!newFormInline.value.albumPics) {
    return [];
  }

  if (newFormInline.value.albumPics.indexOf(",") === -1) {
    previewSelectedFileUrl.value = assembleFileUrl(
      newFormInline.value.albumPics
    );
    previewFilesUrl.value.push(newFormInline.value.albumPics);
    return [
      {
        url: assembleFileUrl(newFormInline.value.albumPics)
      }
    ];
  }

  const split = newFormInline.value.albumPics.split(",");
  const files = [];
  split.forEach(item => {
    const file = {
      url: assembleFileUrl(item)
    };
    previewFilesUrl.value.push(file.url);
    files.push(file);
  });
  previewSelectedFileUrl.value = files.length > 0 ? files[0].url : "";
  return files;
};

/**
 * 组装文件预览地址
 * @param fileId 文件唯一Id
 */
function assembleFileUrl(fileId) {
  return (
    getRequestAddress() +
    filePublicPreviewUrl +
    "?fileId=" +
    fileId +
    "&fileStorageMode=cos&fileStorageStation=mall"
  );
}

const dialogVisible = ref(false);

/**
 * 删除图片
 */
const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  const fileId = parseFileId(uploadFile.url);
  // 删除albumPics里的图片id
  const fileIds = newFormInline.value.albumPics.split(",");
  let albumPics = "";
  for (let i = fileIds.length - 1; i >= 0; i--) {
    if (fileId !== fileIds[i]) {
      albumPics += "," + fileIds[i];
    }
  }
  newFormInline.value.albumPics = albumPics.substring(1);
  // 清理filesUrl里的url
  for (let i = previewFilesUrl.value.length - 1; i >= 0; i--) {
    if (parseFileId(previewFilesUrl.value[i]) === fileId) {
      previewFilesUrl.value.splice(i, 1);
      break;
    }
  }
  // 清理photoWallUrl
  for (let i = photoWallUrl.value.length - 1; i >= 0; i--) {
    if (parseFileId(photoWallUrl.value[i].url) === fileId) {
      photoWallUrl.value.splice(i, 1);
      break;
    }
  }
};

/**
 * 解析图片预览Url获取图片Id
 * @param fileUrl 片预览Url
 */
function parseFileId(fileUrl) {
  const first = fileUrl.substring(fileUrl.indexOf("fileId=") + 7);
  return first.substring(0, first.indexOf("&"));
}

const handlePictureCardPreview: UploadProps["onPreview"] = uploadFile => {
  dialogVisible.value = true;
  if (uploadFile.response) {
    const file = JSON.parse(JSON.stringify(uploadFile.response));
    previewSelectedFileUrl.value = assembleFileUrl(file.data);
  } else {
    previewSelectedFileUrl.value = uploadFile.url;
  }
  previewSelectedFileIndex.value = previewFilesUrl.value.indexOf(
    previewSelectedFileUrl.value
  );
  imageRef.value!.showPreview();
};

/**
 * 图片上传成功执行方法
 * @param uploadFile 响应信息
 */
const handleUploadSuccess: UploadProps["onSuccess"] = uploadFile => {
  if (0 !== uploadFile.code) {
    return;
  }
  if (newFormInline.value.albumPics === "") {
    newFormInline.value.albumPics = uploadFile.data;
  } else {
    newFormInline.value.albumPics += "," + uploadFile.data;
  }
  previewFilesUrl.value.push(assembleFileUrl(uploadFile.data));
};

const handleUploadExceed: UploadProps["onExceed"] = uploadFile => {
  message("图片数量超过限制", {
    type: "warning"
  });
};

/**
 * 图片上传过程中执行方法
 * @param uploadFile
 */
const handleUploadProgress: UploadProps["onProgress"] = uploadFile => {
  console.log(uploadFile);
};

onMounted(() => {
  photoWallUrl.value = getFileList();
});
</script>

<template>
  <div>
    <el-form
      ref="ruleFormRef"
      :model="newFormInline"
      :rules="formRules"
      label-width="82px"
    >
      <el-row :gutter="30">
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="商品名称" prop="productName">
            <el-input
              v-model="newFormInline.productName"
              clearable
              placeholder="请输入商品名称"
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="售价" prop="productPrice">
            <el-input
              v-model="newFormInline.productPrice"
              clearable
              placeholder="请输入商品售价"
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="标签" prop="titles">
            <el-input
              v-model="newFormInline.titles"
              clearable
              placeholder="请输入商品标签"
            />
          </el-form-item>
        </re-col>

        <re-col>
          <el-form-item label="商品备注">
            <el-input
              v-model="newFormInline.remark"
              placeholder="请输入商品说明信息"
              type="textarea"
            />
          </el-form-item>
        </re-col>

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="图片" prop="albumPics">
            <el-input v-model="newFormInline.albumPics" />
          </el-form-item>
        </re-col>

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="商品图片" prop="albumPics">
            <el-upload
              v-model:file-list="photoWallUrl"
              :action="
                getRequestAddress() +
                fileUploadUrl +
                '?fileStorageMode=cos&publicAccess=1&fileStorageStation=mall'
              "
              list-type="picture-card"
              accept="image/jpeg,image/png,image/jpg"
              method="PUT"
              name="uploadfile"
              :disabled="
                newFormInline.title !== '新增' && newFormInline.title !== '编辑'
              "
              :limit="7"
              :headers="{ Authorization: formatToken(getToken().accessToken) }"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess"
              :on-exceed="handleUploadExceed"
              :on-progress="handleUploadProgress"
            >
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>

    <el-image
      v-show="dialogVisible"
      ref="imageRef"
      style="width: 0; height: 0"
      :src="previewSelectedFileUrl"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :preview-src-list="previewFilesUrl"
      show-progress
      :initial-index="previewSelectedFileIndex"
      :infinite="false"
      fit="cover"
    />
  </div>
</template>
