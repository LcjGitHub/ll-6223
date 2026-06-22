import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { Fountain } from '../types';

interface FountainCardProps {
  fountain: Fountain;
  onEdit: (fountain: Fountain) => void;
}

/**
 * 饮水点卡片
 */
export function FountainCard({ fountain, onEdit }: FountainCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Stack justify="space-between" h="100%" gap="sm">
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Title order={4}>{fountain.location}</Title>
            <Badge variant="light" color="teal">
              {fountain.type}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {fountain.city}
          </Text>
          {fountain.waterQualityNote ? (
            <Text size="sm">{fountain.waterQualityNote}</Text>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              暂无水质备注
            </Text>
          )}
          <Text size="xs" c="dimmed">
            最后确认：{fountain.lastConfirmedDate}
          </Text>
        </Stack>
        <Button variant="light" onClick={() => onEdit(fountain)}>
          编辑
        </Button>
      </Stack>
    </Card>
  );
}
