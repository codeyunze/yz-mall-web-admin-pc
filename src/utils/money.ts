/**
 * 金额工具：后端/接口金额单位为「分」，前端展示再换算为「元」。
 */

/**
 * 分 → 元（展示字符串，默认两位小数）
 */
export function fenToYuan(fen?: number | string | null, digits = 2): string {
  const n = Number(fen);
  if (!Number.isFinite(n)) {
    return (0).toFixed(digits);
  }
  return (n / 100).toFixed(digits);
}

/**
 * 分 → 元（数值）
 */
export function fenToYuanNumber(fen?: number | string | null): number {
  const n = Number(fen);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return n / 100;
}

/**
 * 元 → 分（表单提交）
 */
export function yuanToFen(yuan?: number | string | null): number {
  const n = Number(yuan);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.round(n * 100);
}
