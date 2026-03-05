# 配置说明

## 后端 API 地址配置

在项目根目录的 `.env` 文件中配置后端 API 地址：

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 配置说明

- `VITE_API_BASE_URL`: 后端 API 的基础 URL
- 默认值: `http://localhost:8080`
- 修改后需要重启开发服务器

## 使用方式

1. 复制 `.env.example` 为 `.env`
2. 修改 `.env` 中的 `VITE_API_BASE_URL` 为你的后端地址
3. 重启开发服务器

## 示例

### 本地开发
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 生产环境
```env
VITE_API_BASE_URL=https://api.example.com
```

## 注意事项

- 只需要在 `.env` 文件中配置一次
- `src/config/index.ts` 会自动读取 `.env` 中的值
- 修改 `.env` 后必须重启开发服务器才能生效
