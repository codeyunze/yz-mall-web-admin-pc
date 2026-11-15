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
 * 预览地址转成浏览器可访问的地址。
 * 对象存储预签名绝对地址原样返回；网关 `/sys/file/preview/{id}` 补上 `/api` 与 token，由接口 302 到签名地址。
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
