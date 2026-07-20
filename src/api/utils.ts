// 第一个代理后端地址
export const baseUrlApi = (url: string) => `/api${url}`;

/**
 * 从预览 URL 或路径中解析文件 Id
 */
export function parsePreviewFileId(url?: string | null): string {
  if (!url) {
    return "";
  }
  const match = String(url).match(/\/preview\/([^/?#]+)/);
  if (match?.[1]) {
    return match[1];
  }
  // 纯数字视为文件 Id
  if (/^\d+$/.test(String(url).trim())) {
    return String(url).trim();
  }
  return "";
}

/**
 * 将后端/历史预览地址统一转为前端可访问的 `/api/sys/file/preview/{id}?token=`
 * <p>
 * 后端 Feign 常返回直连 sys 的绝对地址或无 `/api` 前缀的相对路径，浏览器无法直达，需改走 Vite 代理。
 */
export function toAccessibleFileUrl(
  url?: string | null,
  token?: string | null
): string {
  if (!url) {
    return "";
  }
  const fileId = parsePreviewFileId(url);
  const accessToken = token ?? "";
  if (fileId) {
    const query = accessToken ? `?token=${accessToken}` : "";
    // 若原 URL 已有 token 且未显式传入，尽量保留
    if (!accessToken) {
      const tokenMatch = String(url).match(/[?&]token=([^&]+)/);
      if (tokenMatch?.[1]) {
        return `/api/sys/file/preview/${fileId}?token=${tokenMatch[1]}`;
      }
    }
    return `/api/sys/file/preview/${fileId}${query}`;
  }
  if (url.startsWith("/api")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `/api${url}`;
  }
  return url;
}

/**
 * 取 albumPics（逗号分隔文件ID）的第一张预览地址
 */
export function firstAlbumPicPreviewUrl(
  albumPics?: string | null,
  token?: string | null
): string {
  if (!albumPics) {
    return "";
  }
  const firstId = albumPics
    .split(",")
    .map(id => id.trim())
    .find(Boolean);
  if (!firstId) {
    return "";
  }
  return toAccessibleFileUrl(firstId, token);
}

// 第二个代理后端地址
// export const baseUrlOtherApi = (url: string) => `/otherApi/${url}`;
