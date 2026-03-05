<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const navLinks = [
  { name: '首页', path: '/' },
  { name: '论坛', path: '/forum' },
  { name: '资讯', path: '/news' },
  { name: '社区', path: '/community' },
  { name: '关于', path: '/about' }
]

const showMobileMenu = ref(false)
const showUserDropdown = ref(false)

// 组件挂载时初始化
onMounted(() => {
  userStore.init()
  // 点击外部关闭下拉菜单
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserDropdown.value = false
  }
}

const handleLogout = async () => {
  await userStore.logout()
  showUserDropdown.value = false
  router.push('/')
}

const goToProfile = () => {
  showUserDropdown.value = false
  router.push('/profile')
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        bbsDemo
      </router-link>

      <!-- 桌面端导航链接 -->
      <div class="nav-links desktop-only">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          :class="{ active: route.path === link.path }"
        >
          {{ link.name }}
        </router-link>
      </div>

      <!-- 用户区域 -->
      <div class="user-area">
        <!-- 已登录 -->
        <div v-if="userStore.isLoggedIn" class="user-menu">
          <div class="user-trigger" @click.stop="toggleUserDropdown">
            <el-avatar :size="36" :src="userStore.avatarUrl" />
            <span class="username">{{ userStore.displayName }}</span>
            <span class="arrow" :class="{ up: showUserDropdown }">▼</span>
          </div>
          
          <!-- 用户下拉菜单 -->
          <div v-show="showUserDropdown" class="dropdown-menu">
            <div class="dropdown-item" @click="goToProfile">
              <span class="icon">👤</span> 个人中心
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" @click="handleLogout">
              <span class="icon">🚪</span> 退出登录
            </div>
          </div>
        </div>

        <!-- 未登录 -->
        <router-link v-else to="/login" class="login-btn">
          登录
        </router-link>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="showMobileMenu = !showMobileMenu">
        <span class="hamburger" :class="{ open: showMobileMenu }"></span>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div v-show="showMobileMenu" class="mobile-menu">
      <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        class="mobile-nav-link"
        :class="{ active: route.path === link.path }"
        @click="showMobileMenu = false"
      >
        {{ link.name }}
      </router-link>
      
      <div class="mobile-divider"></div>
      
      <!-- 移动端用户菜单 -->
      <template v-if="userStore.isLoggedIn">
        <div class="mobile-user-info">
          <el-avatar :size="48" :src="userStore.avatarUrl" />
          <div class="mobile-user-details">
            <div class="mobile-username">{{ userStore.displayName }}</div>
            <div class="mobile-email">{{ userStore.user?.email }}</div>
          </div>
        </div>
        <router-link to="/profile" class="mobile-nav-link" @click="showMobileMenu = false">
          👤 个人中心
        </router-link>
        <div class="mobile-nav-link logout" @click="handleLogout">
          🚪 退出登录
        </div>
      </template>
      
      <router-link v-else to="/login" class="mobile-nav-link" @click="showMobileMenu = false">
        🔑 登录
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: white;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.user-area {
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.user-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  color: white;
  font-size: 0.9rem;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  color: white;
  font-size: 0.7rem;
  transition: transform 0.3s;
}

.arrow.up {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.logout {
  color: #f56c6c;
}

.dropdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 0.25rem 0;
}

.icon {
  font-size: 1rem;
}

.login-btn {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1.25rem;
  border: 2px solid white;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s;
}

.login-btn:hover {
  background: white;
  color: #667eea;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger {
  display: block;
  width: 24px;
  height: 2px;
  background: white;
  position: relative;
  transition: background 0.3s;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: white;
  transition: all 0.3s;
}

.hamburger::before {
  top: -7px;
}

.hamburger::after {
  top: 7px;
}

.hamburger.open {
  background: transparent;
}

.hamburger.open::before {
  transform: rotate(45deg);
  top: 0;
}

.hamburger.open::after {
  transform: rotate(-45deg);
  top: 0;
}

/* 移动端菜单 */
.mobile-menu {
  display: none;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background-color: #f5f5f5;
}

.mobile-nav-link.logout {
  color: #f56c6c;
}

.mobile-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 0.5rem 0;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.mobile-user-details {
  flex: 1;
}

.mobile-username {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.mobile-email {
  font-size: 0.85rem;
  color: #666;
}

/* 响应式 */
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu {
    display: block;
  }

  .user-area {
    display: none;
  }
}
</style>
