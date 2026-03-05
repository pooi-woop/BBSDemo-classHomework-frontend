<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

// 使用 Pinia Store
const userStore = useUserStore()

// 编辑状态
const isEditing = ref(false)
const editNickname = ref('')

// 头像上传 input 引用
const avatarInputRef = ref<HTMLInputElement | null>(null)

// 开始编辑
const startEdit = () => {
  editNickname.value = userStore.user?.nickname || ''
  isEditing.value = true
}

// 保存编辑
const saveEdit = async () => {
  if (editNickname.value.trim()) {
    const success = await userStore.updateUserInfo({ nickname: editNickname.value })
    if (success) {
      isEditing.value = false
    }
  }
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 处理头像上传
const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    await userStore.uploadUserAvatar(input.files[0])
  }
}

// 处理登出
const handleLogout = async () => {
  await userStore.logout()
  // 刷新页面或跳转到首页
  window.location.href = '/'
}

// 组件挂载时初始化
onMounted(() => {
  userStore.init()
})
</script>

<template>
  <div class="user-profile">
    <!-- 调试信息 -->
    <div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 12px;">
      isLoading: {{ userStore.isLoading }}, isLoggedIn: {{ userStore.isLoggedIn }}, user: {{ !!userStore.user }}
    </div>

    <!-- 加载状态 -->
    <div v-if="userStore.isLoading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 未登录状态 -->
    <div v-else-if="!userStore.isLoggedIn" class="not-logged-in">
      <el-empty description="请先登录">
        <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
      </el-empty>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="profile-content">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <el-avatar :size="100" :src="userStore.avatarUrl" />
        <div class="avatar-upload">
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            @change="handleAvatarChange"
            style="display: none"
          />
          <el-button type="primary" size="small" @click="avatarInputRef?.click()">
            更换头像
          </el-button>
        </div>
      </div>

      <!-- 用户信息 -->
      <div class="user-info">
        <!-- 昵称 -->
        <div class="info-item">
          <span class="label">昵称：</span>
          <div v-if="!isEditing" class="value">
            {{ userStore.displayName }}
            <el-button type="primary" link size="small" @click="startEdit">
              编辑
            </el-button>
          </div>
          <div v-else class="edit-form">
            <el-input v-model="editNickname" size="small" style="width: 200px" />
            <el-button type="primary" size="small" @click="saveEdit">保存</el-button>
            <el-button size="small" @click="cancelEdit">取消</el-button>
          </div>
        </div>

        <!-- 邮箱 -->
        <div class="info-item">
          <span class="label">邮箱：</span>
          <span class="value">{{ userStore.user?.email }}</span>
        </div>

        <!-- 注册时间 -->
        <div class="info-item">
          <span class="label">注册时间：</span>
          <span class="value">
            {{ new Date(userStore.user?.created_at || '').toLocaleString() }}
          </span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="userStore.error"
        :title="userStore.error"
        type="error"
        show-icon
        closable
        style="margin-top: 1rem"
      />
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  padding: 2rem;
}

.not-logged-in {
  padding: 4rem 0;
}

.profile-content {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-upload {
  margin-top: 1rem;
}

.user-info {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  font-weight: bold;
  color: #666;
  width: 100px;
  flex-shrink: 0;
}

.value {
  flex: 1;
  color: #333;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.edit-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}
</style>
