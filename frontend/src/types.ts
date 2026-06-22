/** 饮水点数据 */
export interface Fountain {
  id: number;
  city: string;
  location: string;
  type: string;
  waterQualityNote: string;
  lastConfirmedDate: string;
}

/** 编辑饮水点时提交的字段 */
export type FountainUpdatePayload = Omit<Fountain, 'id'>;
