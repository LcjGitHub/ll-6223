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
import { fetchFountains, updateFountain } from './api';
import { FountainCard } from './components/FountainCard';
import { FountainEditModal } from './components/FountainEditModal';
import type { Fountain, FountainUpdatePayload } from './types';

export default function App() {
  const [fountains, setFountains] = useState<Fountain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Fountain | null>(null);

  const loadFountains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFountains();
      setFountains(data);
    } catch {
      setError('加载饮水点失败，请确认后端已启动（端口 3000）');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFountains();
  }, [loadFountains]);

  const handleSave = async (id: number, payload: FountainUpdatePayload) => {
    const updated = await updateFountain(id, payload);
    setFountains((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1}>公共饮水池图鉴</Title>
          <Text c="dimmed">记录城市公共饮水点，便于出行补水参考</Text>
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
            {fountains.map((fountain) => (
              <FountainCard
                key={fountain.id}
                fountain={fountain}
                onEdit={setEditing}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      <FountainEditModal
        fountain={editing}
        opened={editing !== null}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </Container>
  );
}
