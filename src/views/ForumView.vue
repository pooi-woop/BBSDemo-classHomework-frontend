<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

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
    
    // 使用 Vite 代理调用后端
    const response = await axios.get('/api/posts', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value
      },
      timeout: 5000
    })
    
    console.log('获取帖子列表响应:', response.data)
    
    // 后端返回格式: { posts: [...], total: ... }
    const data = response.data
    posts.value = data.posts || []
    total.value = data.total || 0
    
    console.log('帖子数量:', posts.value.length)
    if (posts.value.length > 0) {
      console.log('第一个帖子:', posts.value[0])
    }
  } catch (err: any) {
    console.error('获取帖子列表错误:', err)
    error.value = err.response?.data?.error || err.message || '获取帖子列表失败'
  } finally {
    console.log('fetchPosts 完成，isLoading 设为 false')
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

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
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
  </div>
</template>

<style scoped>
.forum-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.forum-header h1 {
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .forum-container {
    padding: 1rem;
  }
  
  .forum-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
