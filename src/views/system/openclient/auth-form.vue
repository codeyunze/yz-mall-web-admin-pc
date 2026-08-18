<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { AuthFormProps } from "./utils/types";
import { getOpenPermissionOptions } from "@/api/system";

const props = withDefaults(defineProps<{ formInline: AuthFormProps }>(), {
  formInline: () => ({
    clientId: "",
    permissionCodes: [],
    remark: ""
  })
});

const permissionOptions = ref<{ label: string; value: string }[]>([]);
const newFormInline = ref(props.formInline);

watch(
  () => props.formInline,
  val => {
    newFormInline.value = val;
  }
);

onMounted(() => {
  getOpenPermissionOptions().then(res => {
    if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
      permissionOptions.value = res.data;
    } else {
      permissionOptions.value = [
        { label: "车辆档案查询", value: "open:tw:vehicle:query" },
        { label: "最新位置查询", value: "open:tw:telemetry:latest" },
        { label: "轨迹查询", value: "open:tw:telemetry:track" },
        { label: "远程指令", value: "open:tw:command:send" }
      ];
    }
  });
});
</script>

<template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="客户端ID">
        <el-input :model-value="newFormInline.clientId" disabled />
      </el-form-item>

      <el-form-item label="权限码">
        <el-checkbox-group v-model="newFormInline.permissionCodes">
          <el-checkbox
            v-for="opt in permissionOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
            <span class="text-gray-400 text-xs ml-1">({{ opt.value }})</span>
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="newFormInline.remark"
          placeholder="请输入备注信息"
          type="textarea"
          :rows="2"
        />
      </el-form-item>
    </el-form>
  </div>
</template>
