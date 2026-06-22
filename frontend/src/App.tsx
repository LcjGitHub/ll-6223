import {
  Alert,
  Container,
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
import type { Charger, ChargerUpdatePayload } from './types';

export default function App() {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Charger | null>(null);

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

  const handleSave = async (id: number, payload: ChargerUpdatePayload) => {
    const updated = await updateCharger(id, payload);
    setChargers((prev) => prev.map((c) => (c.id === id ? updated : c)));
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
            {error}
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
    </Container>
  );
}
