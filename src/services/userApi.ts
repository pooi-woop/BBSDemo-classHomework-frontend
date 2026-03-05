import api from './api'

// 认证相关 API
export const authApi = {
  // 发送验证码
  sendCode: (data: { email: string; type: 'register' | 'reset' }) => {
    return api.post('/auth/send-code', data)
  },
  
  // 注册
  register: (data: { email: string; password: string; code: string }) => {
    return api.post('/auth/register', data)
  },
  
  // 登录
  login: (data: { email: string; password: string }) => {
    return api.post('/auth/login', data)
  },
  
  // 刷新令牌
  refreshToken: (data: { refresh_token: string }) => {
    return api.post('/auth/refresh', data)
  },
  
  // 登出
  logout: (data: { refresh_token: string }) => {
    return api.post('/logout', data)
  },
  
  // 登出所有设备
  logoutAll: () => {
    return api.post('/logout-all')
  }
}

// 用户相关 API
export const userApi = {
  // 获取用户信息
  getUserInfo: () => {
    return api.get('/profile')
  },
  
  // 更新昵称
  updateNickname: (data: { nickname: string }) => {
    return api.put('/profile/nickname', data)
  },
  
  // 更新简介
  updateBio: (data: { bio: string }) => {
    return api.put('/profile/bio', data)
  },
  
  // 上传头像
  uploadAvatar: (formData: FormData) => {
    return api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 帖子相关 API
export const postApi = {
  // 获取帖子列表
  getPosts: (params: { page: number; page_size: number }) => {
    return api.get('/posts', { params })
  },
  
  // 获取帖子详情
  getPostDetail: (postId: string) => {
    return api.get(`/posts/${postId}`)
  },
  
  // 创建帖子
  createPost: (data: { title: string; content: string }) => {
    return api.post('/posts', data)
  },
  
  // 更新帖子
  updatePost: (postId: string, data: { title: string; content: string }) => {
    return api.put(`/posts/${postId}`, data)
  },
  
  // 删除帖子
  deletePost: (postId: string) => {
    return api.delete(`/posts/${postId}`)
  },
  
  // 获取我的帖子
  getMyPosts: (params: { page: number; page_size: number }) => {
    return api.get('/my/posts', { params })
  }
}

// 评论相关 API
export const commentApi = {
  // 获取评论列表
  getComments: (postId: string, params: { page: number; page_size: number }) => {
    return api.get(`/posts/${postId}/comments`, { params })
  },
  
  // 创建评论
  createComment: (data: { post_id: string; content: string }) => {
    return api.post('/comments', data)
  },
  
  // 更新评论
  updateComment: (commentId: string, data: { content: string }) => {
    return api.put(`/comments/${commentId}`, data)
  },
  
  // 删除评论
  deleteComment: (commentId: string) => {
    return api.delete(`/comments/${commentId}`)
  }
}

// 点赞相关 API
export const likeApi = {
  // 点赞帖子
  likePost: (postId: string) => {
    return api.post(`/posts/${postId}/like`)
  },
  
  // 取消点赞
  unlikePost: (postId: string) => {
    return api.delete(`/posts/${postId}/like`)
  },
  
  // 点赞评论
  likeComment: (commentId: string) => {
    return api.post(`/comments/${commentId}/like`)
  },
  
  // 取消点赞评论
  unlikeComment: (commentId: string) => {
    return api.delete(`/comments/${commentId}/like`)
  }
}
