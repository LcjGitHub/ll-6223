import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { fetchChargers, updateCharger } from './api';
import { ChargerCard } from './components/ChargerCard';
import { ChargerEditModal } from './components/ChargerEditModal';
import { VerificationRecordsDrawer } from './components/VerificationRecordsDrawer';
import type { Charger, ChargerUpdatePayload } from './types';

/**
 * 应用根组件
 * @description 主页面，包含充电桩列表加载、卡片网格展示与编辑弹窗管理
 */
export default function App() {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Charger | null>(null);
  const [viewingRecords, setViewingRecords] = useState<Charger | null>(null);

  /**
   * 加载充电桩列表数据
   * @description 从后端 API 获取所有充电桩数据，失败时设置错误信息
   */
  const loadChargers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChargers();
      setChargers(data);
    } catch {
      setError('加载充电桩失败，请确认后端已启动（端口 3000）');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChargers();
  }, [loadChargers]);

  /**
   * 保存充电桩编辑
   * @param id 充电桩 ID
   * @param payload 更新数据
   * @throws 当 API 请求失败时抛出异常，供弹窗组件显示错误
   */
  const handleSave = async (id: number, payload: ChargerUpdatePayload) => {
    const updated = await updateCharger(id, payload);
    setChargers((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  /**
   * 新增核实记录后的回调，更新充电桩的最后核实日期
   * @param chargerId 充电桩 ID
   * @param newLastVerifiedDate 新的最后核实日期
   */
  const handleRecordAdded = (chargerId: number, newLastVerifiedDate: string) => {
    setChargers((prev) =>
      prev.map((c) =>
        c.id === chargerId
          ? { ...c, lastVerifiedDate: newLastVerifiedDate }
          : c
      )
    );
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1}>城市公共充电桩图鉴</Title>
          <Text c="dimmed">记录城市公共充电桩信息，便于出行充电参考</Text>
        </Stack>

        {error && (
          <Alert color="red" title="加载失败">
            <Stack gap="sm">
              <Text>{error}</Text>
              <Group>
                <Button onClick={loadChargers} variant="light" color="red">
                  重新加载
                </Button>
              </Group>
            </Stack>
          </Alert>
        )}

        {loading ? (
          <Loader />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {chargers.map((charger) => (
              <ChargerCard
                key={charger.id}
                charger={charger}
                onEdit={setEditing}
                onViewRecords={setViewingRecords}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      <ChargerEditModal
        charger={editing}
        opened={editing !== null}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <VerificationRecordsDrawer
        charger={viewingRecords}
        opened={viewingRecords !== null}
        onClose={() => setViewingRecords(null)}
        onRecordAdded={handleRecordAdded}
      />
    </Container>
  );
}
