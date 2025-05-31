# Self-hosting coreCSS

When serving `coreCSS` from your own infrastructure you should mirror the cache and compression settings used on the CDN. Lines 1‑13 of [`deployment/nginx.conf`](../deployment/nginx.conf) show an Nginx snippet configuring gzip and Brotli along with long cache headers:

```nginx
location ~* \.(?:css|png|jpe?g|svg|gif)$ {
    gzip on;
    gzip_static on;
    gzip_types text/css image/svg+xml image/png image/jpeg image/gif;
    brotli on;
    brotli_static on;
    brotli_types text/css image/svg+xml image/png image/jpeg image/gif;
    add_header Cache-Control "public, max-age=31536000";
    etag on;
    add_header Last-Modified $date_gmt;
}
```

These directives ensure assets are compressed when possible and cached by browsers for up to one year. The `ETag` and `Last-Modified` headers allow conditional requests so clients avoid re-downloading unchanged files.

## Hashed file names

The build script renames `core.min.css` to a file containing an eight character SHA‑1 hash (for example `core.77526ae8.min.css`). This unique filename lets you serve the file with `Cache-Control: public, max-age=31536000` because updates produce a completely new filename. When a new build is deployed you must purge any CDN caches so the new hashed file is available; otherwise clients may continue receiving the old file for up to a year.
