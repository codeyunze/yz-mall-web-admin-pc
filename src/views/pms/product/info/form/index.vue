<script setup lang="ts">
import { ref, onMounted } from "vue";
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
    name: "",
    price: 0,
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
const filesUrl = ref([]);
// 选中预览图片地址
const previewFileUrl = ref("");
// 选中预览图片在图片列表里的索引下标
const previewFileIndex = ref(0);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });

const fileList = ref<UploadUserFile[]>([]);

function getRequestAddress() {
  return window.location.href.substring(0, window.location.href.indexOf("/#"));
}

const getFileList = () => {
  if (!newFormInline.value.albumPics) {
    return [];
  }

  if (newFormInline.value.albumPics.indexOf(",") === -1) {
    previewFileUrl.value = assembleFileUrl(newFormInline.value.albumPics);
    filesUrl.value.push(newFormInline.value.albumPics);
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
    filesUrl.value.push(file.url);
    files.push(file);
  });
  previewFileUrl.value = files.length > 0 ? files[0].url : "";
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
    "&fileStorageMode=cos&fileStorageStation=3xj"
  );
}

const dialogVisible = ref(false);

const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles);
};

const handlePictureCardPreview: UploadProps["onPreview"] = uploadFile => {
  console.log(uploadFile);
  dialogVisible.value = true;
  if (uploadFile.response) {
    const file = JSON.parse(JSON.stringify(uploadFile.response));
    previewFileUrl.value = assembleFileUrl(file.data);
  } else {
    previewFileUrl.value = uploadFile.url;
  }
  previewFileIndex.value = filesUrl.value.indexOf(previewFileUrl.value);
  imageRef.value!.showPreview();
};

const handleUploadSuccess: UploadProps["onSuccess"] = uploadFile => {
  if (0 !== uploadFile.code) {
    return;
  }
  if (newFormInline.value.albumPics === "") {
    newFormInline.value.albumPics = uploadFile.data;
  } else {
    newFormInline.value.albumPics += "," + uploadFile.data;
  }
  console.log(assembleFileUrl(uploadFile.data));
  filesUrl.value.push(assembleFileUrl(uploadFile.data));
  filesUrl.value.forEach(item => {
    console.log(item);
  });
};

const handleUploadExceed: UploadProps["onExceed"] = uploadFile => {
  message("图片数量超过限制", {
    type: "warning"
  });
};

const handleUploadProgress: UploadProps["onProgress"] = uploadFile => {
  console.log(uploadFile);
  uploadFile.percent = uploadFile.percent / 2;
};

onMounted(() => {
  console.log("图片信息：" + newFormInline.value.albumPics);
  fileList.value = getFileList();
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
          <el-form-item label="商品名称" prop="name">
            <el-input
              v-model="newFormInline.name"
              clearable
              placeholder="请输入商品名称"
            />
          </el-form-item>
        </re-col>

        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="售价" prop="price">
            <el-input
              v-model="newFormInline.price"
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

        <!-- <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="图片" prop="albumPics">
            <el-input v-model="newFormInline.albumPics" />
          </el-form-item>
        </re-col>-->

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="商品图片" prop="albumPics">
            <el-upload
              v-model:file-list="fileList"
              :action="
                getRequestAddress() +
                fileUploadUrl +
                '?fileStorageMode=cos&publicAccess=1&fileStorageStation=3xj'
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
      :src="previewFileUrl"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :preview-src-list="filesUrl"
      show-progress
      :initial-index="previewFileIndex"
      :infinite="false"
      fit="cover"
    />
  </div>
</template>
