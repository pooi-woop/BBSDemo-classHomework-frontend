<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postApi, commentApi, likeApi } from '../services/userApi'

const route = useRoute()
const router = useRouter()

const postId = ref(route.params.id as string)
const post = ref<any>(null)
const comments = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)
const isLoading = ref(false)
const error = ref('')
const commentContent = ref('')

// 获取帖子详情
const fetchPostDetail = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const response = await postApi.getPostDetail(postId.value)
    console.log('获取帖子详情响应:', response)
    // 后端返回格式: { post: { id: ..., title: ..., ... } }
    post.value = response.post || response
  } catch (err: any) {
    error.value = err.response?.data?.error || '获取帖子详情失败'
    console.error('获取帖子详情错误', err)
  } finally {
    isLoading.value = false
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const response = await commentApi.getComments(postId.value, {
      page: currentPage.value,
      page_size: pageSize.value
    })
    
    comments.value = response.data || []
    totalComments.value = response.total || 0
  } catch (err: any) {
    console.error('获取评论列表错误', err)
  }
}

// 点赞帖子
const handleLikePost = async () => {
  try {
    if (post.value.is_liked) {
      await likeApi.unlikePost(postId.value)
      post.value.is_liked = false
      post.value.like_count = Math.max(0, (post.value.like_count || 0) - 1)
    } else {
      await likeApi.likePost(postId.value)
      post.value.is_liked = true
      post.value.like_count = (post.value.like_count || 0) + 1
    }
  } catch (err: any) {
    console.error('点赞操作错误', err)
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) return
  
  try {
    await commentApi.createComment({
      post_id: postId.value,
      content: commentContent.value
    })
    
    // 清空评论内容并重新获取评论列表
    commentContent.value = ''
    currentPage.value = 1
    await fetchComments()
    // 更新帖子评论数
    post.value.comment_count = (post.value.comment_count || 0) + 1
  } catch (err: any) {
    error.value = err.response?.data?.error || '提交评论失败'
    console.error('提交评论错误', err)
  }
}

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchComments()
}

// 初始加载
onMounted(async () => {
  await fetchPostDetail()
  await fetchComments()
})
</script>

<template>
  <div class="post-detail-container">
    <!-- 帖子详情 -->
    <div v-if="post" class="post-detail">
      <h1 class="post-title">{{ post.title }}</h1>
      <div class="post-meta">
        <span class="post-author">{{ post.user?.nickname || '匿名用户' }}</span>
        <span class="post-time">{{ new Date(post.created_at).toLocaleString() }}</span>
      </div>
      <div class="post-content">
        {{ post.content }}
      </div>
      <div class="post-actions">
        <el-button 
          :type="post.is_liked ? 'primary' : 'default'"
          @click="handleLikePost"
        >
          <el-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" /></svg></el-icon>
          {{ post.like_count || 0 }}
        </el-button>
        <el-button>
          <el-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M7.5 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75ZM7.5 12a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75ZM7.5 15.75a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" /></svg></el-icon>
          {{ post.comment_count || 0 }}
        </el-button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 评论区 -->
    <div v-if="post" class="comments-section">
      <h2>评论 ({{ post.comment_count || 0 }})</h2>
      
      <!-- 评论输入框 -->
      <div class="comment-input">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
        />
        <el-button type="primary" @click="submitComment" style="margin-top: 1rem;">
          提交评论
        </el-button>
      </div>
      
      <!-- 评论列表 -->
      <div class="comments-list">
        <el-card v-for="comment in comments" :key="comment.id" class="comment-card">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user?.nickname || '匿名用户' }}</span>
            <span class="comment-time">{{ new Date(comment.created_at).toLocaleString() }}</span>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
        </el-card>
      </div>
      
      <!-- 空状态 -->
      <div v-if="comments.length === 0 && !isLoading" class="empty-state">
        <el-empty description="暂无评论" />
      </div>
      
      <!-- 评论分页 -->
      <div v-if="totalComments > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalComments"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.post-detail {
  margin-bottom: 3rem;
}

.post-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 1.5rem;
}

.post-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 2rem;
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.comments-section {
  margin-top: 3rem;
}

.comments-section h2 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
}

.comment-input {
  margin-bottom: 2rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.comment-card {
  transition: box-shadow 0.3s ease;
}

.comment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 0.8rem;
  color: #999;
}

.comment-content {
  color: #666;
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.loading-state {
  margin: 2rem 0;
}

.error-message {
  margin: 2rem 0;
  padding: 1rem;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  text-align: center;
}

.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .post-detail-container {
    padding: 0 1rem;
  }
  
  .post-title {
    font-size: 1.5rem;
  }
}
</style>
