<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userApi } from '../services/userApi'
import { blockApi } from '../services/userApi'
import { postApi } from '../services/userApi'
import { ElMessage, ElAvatar, ElButton, ElTag, ElEmpty, ElLoading, ElPopconfirm } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 状态管理
const user = ref<any>(null)
const userPosts = ref<any[]>([])
const isLoading = ref(false)
const isLoadingPosts = ref(false)
const error = ref('')
const isBlocked = ref(false)
const isBlocking = ref(false)

// 获取用户ID
const userId = computed(() => route.params.id as string)

// 页面加载
onMounted(async () => {
  await fetchUserProfile()
  await fetchUserPosts()
})

// 获取用户个人资料
const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const response = await userApi.getUserProfile(userId.value)
    user.value = response
    
    // 检查是否已拉黑
    await checkBlockStatus()
  } catch (err: any) {
    console.error('获取用户个人资料错误:', err)
    error.value = err.response?.error || '获取用户个人资料失败'
    ElMessage.error(error.value)
  } finally {
    isLoading.value = false
  }
}

// 检查拉黑状态
const checkBlockStatus = async () => {
  try {
    const response = await blockApi.getBlockedUsers({ page: 1, page_size: 100 })
    const blockedUsers = response.data || response || []
    isBlocked.value = blockedUsers.some((u: any) => u.id === userId.value || u.user?.id === userId.value)
  } catch (err) {
    console.error('检查拉黑状态错误:', err)
  }
}

// 获取用户帖子
const fetchUserPosts = async () => {
  try {
    isLoadingPosts.value = true
    
    const response = await postApi.getPosts({ page: 1, page_size: 10 })
    // 过滤出当前用户的帖子
    const allPosts = response.data || response || []
    userPosts.value = allPosts.filter((post: any) => post.user?.id === userId.value)
  } catch (err: any) {
    console.error('获取用户帖子错误:', err)
    ElMessage.error('获取用户帖子失败')
  } finally {
    isLoadingPosts.value = false
  }
}

// 处理拉黑/取消拉黑
const handleBlockUser = async () => {
  try {
    isBlocking.value = true
    
    if (isBlocked.value) {
      // 取消拉黑
      await blockApi.unblockUser(userId.value)
      ElMessage.success('取消拉黑成功')
    } else {
      // 拉黑
      await blockApi.blockUser(userId.value)
      ElMessage.success('拉黑成功')
    }
    
    // 更新拉黑状态
    isBlocked.value = !isBlocked.value
  } catch (err: any) {
    console.error('操作失败:', err)
    ElMessage.error(err.response?.error || '操作失败')
  } finally {
    isBlocking.value = false
  }
}

// 查看帖子详情
const viewPostDetail = (postId: string) => {
  router.push(`/post/${postId}`)
}

// 获取用户显示名
const getUserName = () => {
  if (!user.value) return '加载中...'
  if (user.value.nickname) return user.value.nickname
  if (user.value.email) return user.value.email.split('@')[0]
  return '未知用户'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算用户等级（示例）
const getUserLevel = () => {
  if (!user.value) return 1
  // 简单的等级计算逻辑
  return Math.floor(Math.random() * 10) + 1
}

// 获取帖子浏览量（支持多种字段名）
const getPostViews = (post: any) => {
  if (!post) return 0
  
  // 尝试多种可能的字段名
  return post.views || 
         post.view_count || 
         post.visits || 
         post.visit_count || 0
}

import { computed } from 'vue'
</script>

<template>
  <div class="user-profile-container">
    <el-loading v-loading="isLoading" :text="'加载用户资料...'" />
    
    <!-- 错误提示 -->
    <el-alert 
      v-if="error" 
      :title="error" 
      type="error" 
      show-icon 
      closable 
      style="margin-bottom: 1rem" 
    />
    
    <!-- 用户资料卡片 -->
    <div v-if="user" class="user-card">
      <div class="user-header">
        <el-avatar :src="user.avatar" :size="80" class="user-avatar">
          {{ getUserName().charAt(0) }}
        </el-avatar>
        <div class="user-info">
          <h2 class="user-name">{{ getUserName() }}</h2>
          <div class="user-meta">
            <el-tag size="small" effect="plain">Lv.{{ getUserLevel() }}</el-tag>
            <span class="user-joined">加入时间: {{ formatDate(user.created_at) }}</span>
          </div>
          <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>
        </div>
        <div class="user-actions">
          <el-popconfirm
            :title="isBlocked ? '确定要取消拉黑吗？' : '确定要拉黑该用户吗？'"
            @confirm="handleBlockUser"
          >
            <template #reference>
              <el-button :type="isBlocked ? 'warning' : 'default'" :loading="isBlocking">
                {{ isBlocked ? '已拉黑' : '拉黑' }}
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
    
    <!-- 帖子列表 -->
    <div class="user-posts">
      <h3>用户帖子</h3>
      
      <el-loading v-loading="isLoadingPosts" :text="'加载帖子...'" />
      
      <div v-if="userPosts.length === 0 && !isLoadingPosts" class="empty-posts">
        <el-empty description="该用户暂无帖子" />
      </div>
      
      <div v-else class="posts-list">
        <div 
          v-for="post in userPosts" 
          :key="post.id" 
          class="post-item"
          @click="viewPostDetail(post.id)"
        >
          <h4 class="post-title">{{ post.title }}</h4>
          <p class="post-excerpt">{{ post.content.substring(0, 100) }}...</p>
          <div class="post-meta">
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
            <span class="post-stats">
              {{ getPostViews(post) }} 浏览 · {{ post.likes || 0 }} 点赞 · {{ post.comments || 0 }} 评论
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.user-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.user-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.user-avatar {
  border: 3px solid #f0f0f0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.user-bio {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.user-posts {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.user-posts h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.empty-posts {
  padding: 3rem 0;
  text-align: center;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  padding: 1.5rem;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-title {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.post-excerpt {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.4;
  font-size: 0.95rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .user-profile-container {
    padding: 0 1rem;
  }
  
  .user-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .user-actions {
    margin-top: 1rem;
  }
  
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>