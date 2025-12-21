/** 文件信息 */
export interface FormItemProps {
  /** 文件ID */
  id: string | number;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  /** 文件名 */
  fileName: string;
  /** 文件路径 */
  filePath: string;
  /** 文件类型 */
  fileType: string;
  /** 文件大小（字节） */
  fileSize: string | number;
  /** 文件存储站 */
  fileStorageStation: string;
  /** 文件存储模式 */
  fileStorageMode: string;
  /** 预览地址 */
  previewAddress: string | null;
}
