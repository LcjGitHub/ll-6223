import axios from 'axios';
import type { Fountain, FountainUpdatePayload } from './types';

const client = axios.create({
  baseURL: '/api',
});

/**
 * 获取全部饮水点
 */
export async function fetchFountains(): Promise<Fountain[]> {
  const { data } = await client.get<Fountain[]>('/fountains');
  return data;
}

/**
 * 更新饮水点
 */
export async function updateFountain(
  id: number,
  payload: FountainUpdatePayload
): Promise<Fountain> {
  const { data } = await client.put<Fountain>(`/fountains/${id}`, payload);
  return data;
}
