<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '../services/userApi'

const router = useRouter()

const posts = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false)
const error = ref('')

const fetchPosts = async () => {
  console.log('fetchPosts 被调用')
  try {
    isLoading.value = true
    error.value = ''
    
    console.log('开始获取帖子列表...', 'page:', currentPage.value, 'page_size:', pageSize.value)
    
    const response = await postApi.getPosts({
      page: currentPage.value,
      page_size: pageSize.value
    })
    console.log('获取帖子列表响应:', response)
    // 后端返回格式: { posts: [...], total: ... }
    posts.value = response.posts || response.data || []
    total.value = response.total || 0
  } catch (err: any) {
    console.error('获取帖子列表错误:', err)
    error.value = err.response?.data?.error || '获取帖子列表失败'
  } finally {
    isLoading.value = false
  }
}

const goToPostDetail = (postId: string | number) => {
  console.log('点击帖子，ID:', postId)
  if (!postId) {
    error.value = '帖子ID无效'
    return
  }
  router.push(`/forum/${postId}`)
}

const handlePageChange = () => {
  fetchPosts()
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

// 获取作者显示名
const getAuthorName = (post: any) => {
  if (post.user?.nickname) return post.user.nickname
  if (post.user?.email) return post.user.email.split('@')[0]
  return '匿名用户'
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="forum-container">
    <div class="forum-header">
      <h1>论坛</h1>
      <el-button type="primary" @click="router.push('/forum/create')">
        发布帖子
      </el-button>
    </div>

    <!-- 帖子列表 -->
    <el-table
      v-loading="isLoading"
      :data="posts"
      style="width: 100%"
      stripe
    >
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <el-link type="primary" @click="goToPostDetail(row.id)">
            {{ row.title || '无标题' }}
          </el-link>
        </template>
      </el-table-column>
      
      <el-table-column label="作者" width="120">
        <template #default="{ row }">
          {{ getAuthorName(row) }}
        </template>
      </el-table-column>
      
      <el-table-column label="发布时间" width="150">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="views" label="浏览" width="80" align="center" />
      
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="goToPostDetail(row.id)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty v-if="posts.length === 0 && !isLoading" description="暂无帖子" />

    <!-- 错误提示 -->
    <el-alert v-if="error" :title="error" type="error" show-icon closable style="margin-top: 1rem" />

    <!-- 分页 - 固定在底部 -->
    <div v-if="total > 0" class="pagination-fixed">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, prev, pager, next"
        :total="total"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 底部占位，防止内容被分页遮挡 -->
    <div v-if="total > 0" class="pagination-placeholder"></div>
  </div>
</template>

<style scoped>
.forum-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 2rem;
  box-sizing: border-box;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.forum-header h1 {
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.pagination-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.pagination-placeholder {
  height: 60px;
}

@media (max-width: 768px) {
  .forum-container {
    padding: 1rem;
  }
  
  .forum-header {
    flex-direction: column;
    gap: 1rem;
    padding: 0;
  }
}
</style>
