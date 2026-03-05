import api from './api'

// 认证相关 API
export const authApi = {
  // 发送验证码
  sendCode: (data: { email: string; type: 'register' | 'reset' }) => {
    return api.post('/api/auth/send-code', data)
  },
  
  // 注册
  register: (data: { email: string; password: string; code: string }) => {
    return api.post('/api/auth/register', data)
  },
  
  // 登录
  login: (data: { email: string; password: string }) => {
    return api.post('/api/auth/login', data)
  },
  
  // 刷新令牌
  refreshToken: (data: { refresh_token: string }) => {
    return api.post('/api/auth/refresh', data)
  },
  
  // 登出
  logout: (data: { refresh_token: string }) => {
    return api.post('/api/logout', data)
  },
  
  // 登出所有设备
  logoutAll: () => {
    return api.post('/api/logout-all')
  }
}

// 用户相关 API
export const userApi = {
  // 获取用户信息
  getUserInfo: () => {
    return api.get('/api/profile')
  },
  
  // 更新昵称
  updateNickname: (data: { nickname: string }) => {
    return api.put('/api/profile/nickname', data)
  },
  
  // 上传头像
  uploadAvatar: (formData: FormData) => {
    return api.post('/api/profile/avatar', formData, {
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
    return api.get('/api/posts', { params })
  },
  
  // 获取帖子详情
  getPostDetail: (postId: string) => {
    return api.get(`/api/posts/${postId}`)
  },
  
  // 创建帖子
  createPost: (data: { title: string; content: string }) => {
    return api.post('/api/posts', data)
  },
  
  // 更新帖子
  updatePost: (postId: string, data: { title: string; content: string }) => {
    return api.put(`/api/posts/${postId}`, data)
  },
  
  // 删除帖子
  deletePost: (postId: string) => {
    return api.delete(`/api/posts/${postId}`)
  },
  
  // 获取我的帖子
  getMyPosts: (params: { page: number; page_size: number }) => {
    return api.get('/api/my/posts', { params })
  }
}

// 评论相关 API
export const commentApi = {
  // 获取评论列表
  getComments: (postId: string, params: { page: number; page_size: number }) => {
    return api.get(`/api/posts/${postId}/comments`, { params })
  },
  
  // 创建评论
  createComment: (data: { post_id: string; content: string }) => {
    return api.post('/api/comments', data)
  },
  
  // 删除评论
  deleteComment: (commentId: string) => {
    return api.delete(`/api/comments/${commentId}`)
  },
  
  // 获取回复列表
  getReplies: (commentId: string, params: { page: number; page_size: number }) => {
    return api.get(`/api/comments/${commentId}/replies`, { params })
  }
}

// 点赞相关 API
export const likeApi = {
  // 点赞帖子
  likePost: (postId: string) => {
    return api.post(`/api/posts/${postId}/like`)
  },
  
  // 取消点赞帖子
  unlikePost: (postId: string) => {
    return api.delete(`/api/posts/${postId}/like`)
  },
  
  // 点赞评论
  likeComment: (commentId: string) => {
    return api.post(`/api/comments/${commentId}/like`)
  },
  
  // 取消点赞评论
  unlikeComment: (commentId: string) => {
    return api.delete(`/api/comments/${commentId}/like`)
  }
}

// 收藏相关 API
export const favoriteApi = {
  // 获取收藏夹
  getFolders: () => {
    return api.get('/api/folders')
  },
  
  // 创建收藏夹
  createFolder: (data: { name: string }) => {
    return api.post('/api/folders', data)
  },
  
  // 更新收藏夹
  updateFolder: (folderId: string, data: { name: string }) => {
    return api.put(`/api/folders/${folderId}`, data)
  },
  
  // 删除收藏夹
  deleteFolder: (folderId: string) => {
    return api.delete(`/api/folders/${folderId}`)
  },
  
  // 收藏帖子
  addFavorite: (data: { post_id: string; folder_id: string }) => {
    return api.post('/api/favorites', data)
  },
  
  // 取消收藏
  removeFavorite: (postId: string) => {
    return api.delete(`/api/posts/${postId}/favorite`)
  },
  
  // 移动收藏
  moveFavorite: (postId: string, data: { folder_id: string }) => {
    return api.put(`/api/posts/${postId}/favorite`, data)
  },
  
  // 获取收藏列表
  getFavorites: (params: { page: number; page_size: number }) => {
    return api.get('/api/my/favorites', { params })
  },
  
  // 按收藏夹获取收藏
  getFavoritesByFolder: (folderId: string, params: { page: number; page_size: number }) => {
    return api.get(`/api/folders/${folderId}/posts`, { params })
  }
}

// 拉黑相关 API
export const blockApi = {
  // 拉黑用户
  blockUser: (userId: string) => {
    return api.post(`/api/users/${userId}/block`)
  },
  
  // 取消拉黑
  unblockUser: (userId: string) => {
    return api.delete(`/api/users/${userId}/block`)
  },
  
  // 获取拉黑列表
  getBlockedUsers: (params: { page: number; page_size: number }) => {
    return api.get('/api/my/blocked', { params })
  }
}
