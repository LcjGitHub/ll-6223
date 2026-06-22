import axios from 'axios';
import type { Charger, ChargerUpdatePayload } from './types';

const client = axios.create({
  baseURL: '/api',
});

export async function fetchChargers(): Promise<Charger[]> {
  const { data } = await client.get<Charger[]>('/chargers');
  return data;
}

export async function updateCharger(
  id: number,
  payload: ChargerUpdatePayload
): Promise<Charger> {
  const { data } = await client.put<Charger>(`/chargers/${id}`, payload);
  return data;
}
