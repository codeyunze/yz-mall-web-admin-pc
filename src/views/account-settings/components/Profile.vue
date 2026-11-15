<script setup lang="ts">
import { reactive, ref } from "vue";
import { formUpload } from "@/api/mock";
import { getUserList, updateUserById } from "@/api/system";
import { message } from "@/utils/message";
import { userKey, type DataInfo } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import type { FormInstance, FormRules } from "element-plus";
import ReCropperPreview from "@/components/ReCropperPreview";
import {
  createFormData,
  deviceDetection,
  storageLocal
} from "@pureadmin/utils";
import uploadLine from "@iconify-icons/ri/upload-line";

defineOptions({
  name: "Profile"
});

const imgSrc = ref("");
const cropperBlob = ref();
const cropRef = ref();
const uploadRef = ref();
const isShow = ref(false);
const userInfoFormRef = ref<FormInstance>();

const submitting = ref(false);
const userInfos = reactive({
  id: "",
  avatar: "",
  username: "",
  email: "",
  phone: "",
  sex: undefined as number | undefined,
  status: undefined as number | undefined
});

const rules = reactive<FormRules>({
  username: [
    { required: true, message: "昵称必填", trigger: "blur" },
    { max: 10, message: "昵称不能超过10个字符", trigger: "blur" }
  ],
  phone: [
    { required: true, message: "联系电话必填", trigger: "blur" },
    { max: 11, message: "联系电话不能超过11个字符", trigger: "blur" }
  ],
  email: [{ max: 50, message: "邮箱不能超过50个字符", trigger: "blur" }]
});

function queryEmail(queryString, callback) {
  const emailList = [
    { value: "@qq.com" },
    { value: "@126.com" },
    { value: "@163.com" }
  ];
  let results = [];
  let queryList = [];
  emailList.map(item =>
    queryList.push({ value: queryString.split("@")[0] + item.value })
  );
  results = queryString
    ? queryList.filter(
        item =>
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    : queryList;
  callback(results);
}

const onChange = uploadFile => {
  const reader = new FileReader();
  reader.onload = e => {
    imgSrc.value = e.target.result as string;
    isShow.value = true;
  };
  reader.readAsDataURL(uploadFile.raw);
};

const handleClose = () => {
  cropRef.value.hidePopover();
  uploadRef.value.clearFiles();
  isShow.value = false;
};

const onCropper = ({ blob }) => (cropperBlob.value = blob);

const handleSubmitImage = () => {
  const formData = createFormData({
    files: new File([cropperBlob.value], "avatar")
  });
  formUpload(formData)
    .then(({ success, data }) => {
      if (success) {
        message("更新头像成功", { type: "success" });
        handleClose();
      } else {
        message("更新头像失败");
      }
    })
    .catch(error => {
      message(`提交异常 ${error}`, { type: "error" });
    });
};

const syncLoginName = (username: string) => {
  const store = useUserStoreHook();
  store.SET_USERNAME(username);
  store.SET_NICKNAME(username);
  const cached = storageLocal().getItem<DataInfo<number>>(userKey);
  if (cached) {
    cached.username = username;
    storageLocal().setItem(userKey, cached);
  }
};

const loadProfile = async () => {
  const userId = useUserStoreHook().userId;
  if (!userId) {
    message("未获取到当前用户", { type: "error" });
    return;
  }
  const res = await getUserList({
    current: 1,
    size: 1,
    filter: { userIds: [userId] }
  });
  const user = res.data?.items?.[0];
  if (res.code !== 0 || !user) {
    message(res.msg || "获取个人信息失败", { type: "error" });
    return;
  }
  userInfos.id = user.id;
  userInfos.avatar = user.avatar || "";
  userInfos.username = user.username || "";
  userInfos.email = user.email || "";
  userInfos.phone = user.phone || "";
  userInfos.sex = user.sex;
  userInfos.status = user.status;
};

const onSubmit = async (formEl?: FormInstance) => {
  if (!formEl) return;
  const valid = await formEl.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const res = await updateUserById({
      id: userInfos.id,
      username: userInfos.username.trim(),
      phone: userInfos.phone.trim(),
      email: userInfos.email.trim(),
      sex: userInfos.sex,
      status: userInfos.status
    });
    if (res.code === 0) {
      userInfos.username = userInfos.username.trim();
      syncLoginName(userInfos.username);
      message("更新信息成功", { type: "success" });
      return;
    }
    message(res.msg || "更新信息失败", { type: "error" });
  } finally {
    submitting.value = false;
  }
};

loadProfile();
</script>

<template>
  <div
    :class="[
      'min-w-[180px]',
      deviceDetection() ? 'max-w-[100%]' : 'max-w-[70%]'
    ]"
  >
    <h3 class="my-8">个人信息</h3>
    <el-form
      ref="userInfoFormRef"
      label-position="top"
      :rules="rules"
      :model="userInfos"
    >
      <el-form-item label="头像">
        <el-avatar :size="80" :src="userInfos.avatar" />
        <el-upload
          ref="uploadRef"
          accept="image/*"
          action="#"
          :limit="1"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onChange"
        >
          <el-button plain class="ml-4">
            <IconifyIconOffline :icon="uploadLine" />
            <span class="ml-2">更新头像</span>
          </el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="昵称" prop="username">
        <el-input v-model="userInfos.username" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-autocomplete
          v-model="userInfos.email"
          :fetch-suggestions="queryEmail"
          :trigger-on-focus="false"
          placeholder="请输入邮箱"
          clearable
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input
          v-model="userInfos.phone"
          placeholder="请输入联系电话"
          clearable
        />
      </el-form-item>
      <el-button
        type="primary"
        :loading="submitting"
        @click="onSubmit(userInfoFormRef)"
      >
        更新信息
      </el-button>
    </el-form>
    <el-dialog
      v-model="isShow"
      width="40%"
      title="编辑头像"
      destroy-on-close
      :closeOnClickModal="false"
      :before-close="handleClose"
      :fullscreen="deviceDetection()"
    >
      <ReCropperPreview ref="cropRef" :imgSrc="imgSrc" @cropper="onCropper" />
      <template #footer>
        <div class="dialog-footer">
          <el-button bg text @click="handleClose">取消</el-button>
          <el-button bg text type="primary" @click="handleSubmitImage">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
