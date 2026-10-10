FROM nginx:alpine

# 复制前端静态文件
COPY src/renderer/ /usr/share/nginx/html/

# 复制 manifest 生成脚本并执行
COPY scripts/generate-manifest.sh /tmp/generate-manifest.sh
RUN chmod +x /tmp/generate-manifest.sh && /tmp/generate-manifest.sh

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 部分 NAS 上入口脚本 10-listen-on-ipv6-by-default.sh 内的 apk manifest 会挂起，移除该脚本
RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh

EXPOSE 80
