<script setup lang="ts">
import { ref, onMounted } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "@/views/pms/product/info/utils/rule";
import { FormProps } from "@/views/pms/product/info/utils/types";
import { Plus } from "@element-plus/icons-vue";
import type { UploadProps, UploadUserFile } from "element-plus";
import { formatToken, getToken } from "@/utils/auth";
import { filePreviewUrl, fileUpload } from "@/api/system";
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

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });

const fileList = ref<UploadUserFile[]>([]);

const getFileList = () => {
  console.log("获取图片信息前执行代码");
  var fileUrl = filePreviewUrl;
  console.log(fileUrl);
  return [
    {
      name: "food.jpeg",
      url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100"
    },
    {
      name: "food.jpeg",
      url: "http://localhost:8899/api/file/public/preview?fileStorageMode=cos&fileId=1895001369306943488&fileStorageStation=home"
    }
  ];
};

const url =
  "http://localhost:8899/api/file/public/preview?fileStorageMode=cos&fileId=1895001369306943488&fileStorageStation=home";

const fileUrl = [
  "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
  "http://localhost:8899/api/file/public/preview?fileStorageMode=cos&fileId=1895001369306943488&fileStorageStation=home"
];

const dialogVisible = ref(false);

const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles);
  console.log(fileUpload);
};

const handlePictureCardPreview: UploadProps["onPreview"] = uploadFile => {
  dialogVisible.value = true;
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
};

const handleUploadExceed: UploadProps["onExceed"] = uploadFile => {
  message("图片数量超过限制", {
    type: "warning"
  });
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

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="图片" prop="titles">
            <el-input v-model="newFormInline.albumPics" />
          </el-form-item>
        </re-col>

        <re-col :value="24" :xs="24" :sm="24">
          <el-form-item label="商品图片">
            <el-upload
              v-model:file-list="fileList"
              action="http://localhost:8899/api/file/upload?fileStorageMode=cos&publicAccess=1"
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
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>

    <el-image
      v-show="dialogVisible"
      ref="imageRef"
      style="width: 0; height: 0"
      :src="url"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :preview-src-list="fileUrl"
      show-progress
      :initial-index="4"
      fit="cover"
    />
  </div>
</template>
