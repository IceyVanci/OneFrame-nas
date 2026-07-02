FROM nginx:alpine

# 复制前端静态文件
COPY src/renderer/ /usr/share/nginx/html/

# 复制 manifest 生成脚本并执行
COPY scripts/generate-manifest.sh /tmp/generate-manifest.sh
RUN chmod +x /tmp/generate-manifest.sh && /tmp/generate-manifest.sh

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
