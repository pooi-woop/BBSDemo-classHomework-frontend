<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home-container">
    <!-- 背景图片 -->
    <div class="bg-image"></div>
    
    <!-- 主要内容 -->
    <main class="hero-section">
      <div class="hero-content">
        <h1>bbsDemo</h1>
        <p>探索论坛世界，分享你的热爱</p>
        <el-button type="primary" size="large" @click="router.push('/forum')">
          进入论坛
        </el-button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  filter: brightness(0.6);
}

.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 1rem;
}

.hero-content {
  color: #fff;
  max-width: 600px;
}

.hero-content h1 {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-content p {
  font-size: clamp(1rem, 3vw, 1.25rem);
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
}

:deep(.el-button--large) {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 0.5rem;
  }
  
  :deep(.el-button--large) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
