import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { Charger } from '../types';

interface ChargerCardProps {
  charger: Charger;
  onEdit: (charger: Charger) => void;
}

export function ChargerCard({ charger, onEdit }: ChargerCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Stack justify="space-between" h="100%" gap="sm">
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Title order={4}>{charger.location}</Title>
            <Badge variant="light" color="green">
              {charger.chargerType}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {charger.city}
          </Text>
          {charger.powerNote ? (
            <Text size="sm">{charger.powerNote}</Text>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              暂无功率说明
            </Text>
          )}
          <Text size="xs" c="dimmed">
            最后核实：{charger.lastVerifiedDate}
          </Text>
        </Stack>
        <Button variant="light" onClick={() => onEdit(charger)}>
          编辑
        </Button>
      </Stack>
    </Card>
  );
}
