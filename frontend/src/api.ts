import axios from 'axios';
import type {
  Charger,
  ChargerUpdatePayload,
  VerificationRecord,
  VerificationRecordCreatePayload,
} from './types';

/**
 * @fileoverview API 接口封装模块
 * @description 使用 Axios 封装后端 RESTful API 调用，通过 Vite 代理转发至后端 3000 端口
 */

/**
 * Axios 客户端实例
 * @description 基础 URL 为 /api，由 Vite 代理转发到 http://localhost:3000
 */
const client = axios.create({
  baseURL: '/api',
});

/**
 * 获取充电桩列表
 * @async
 * @returns {Promise<Charger[]>} 充电桩对象数组，按 ID 升序排列
 * @throws {AxiosError} 网络错误或后端返回非 2xx 状态码时抛出
 */
export async function fetchChargers(): Promise<Charger[]> {
  const { data } = await client.get<Charger[]>('/chargers');
  return data;
}

/**
 * 更新充电桩信息
 * @async
 * @param {number} id 充电桩唯一标识
 * @param {ChargerUpdatePayload} payload 更新数据，包含 5 个字段
 * @returns {Promise<Charger>} 更新后的充电桩对象
 * @throws {AxiosError} 网络错误或后端返回非 2xx 状态码时抛出，错误信息包含中文提示
 */
export async function updateCharger(
  id: number,
  payload: ChargerUpdatePayload
): Promise<Charger> {
  const { data } = await client.put<Charger>(`/chargers/${id}`, payload);
  return data;
}

/**
 * 获取充电桩核实记录列表
 * @async
 * @param {number} chargerId 充电桩唯一标识
 * @returns {Promise<VerificationRecord[]>} 核实记录数组，按核实日期降序排列
 * @throws {AxiosError} 网络错误或后端返回非 2xx 状态码时抛出
 */
export async function fetchChargerVerifications(
  chargerId: number
): Promise<VerificationRecord[]> {
  const { data } = await client.get<VerificationRecord[]>(
    `/chargers/${chargerId}/verifications`
  );
  return data;
}

/**
 * 新增核实记录
 * @async
 * @param {number} chargerId 充电桩唯一标识
 * @param {VerificationRecordCreatePayload} payload 核实记录数据
 * @returns {Promise<VerificationRecord>} 新增的核实记录对象
 * @throws {AxiosError} 网络错误或后端返回非 2xx 状态码时抛出
 */
export async function createVerificationRecord(
  chargerId: number,
  payload: VerificationRecordCreatePayload
): Promise<VerificationRecord> {
  const { data } = await client.post<VerificationRecord>(
    `/chargers/${chargerId}/verifications`,
    payload
  );
  return data;
}
