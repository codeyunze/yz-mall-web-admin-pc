interface FormItemProps {
  /** 用于判断是`新增`还是`修改` */
  title: string;
  id?: number;
  seriesId?: number;
  seriesCode?: string;
  seriesName?: string;
  modelCode?: string;
  modelName?: string;
  energyType?: number;
  driveType?: number;
  seatCount?: number;
  batteryKwh?: number;
  rangeKm?: number;
  coverFileId?: number;
  sortNo?: number;
  status?: number;
  remark?: string;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
