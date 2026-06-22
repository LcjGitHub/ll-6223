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

/**
 * 充电桩卡片组件属性
 */
interface ChargerCardProps {
  /** 充电桩数据对象 */
  charger: Charger;
  /** 点击编辑按钮的回调，传入当前充电桩数据 */
  onEdit: (charger: Charger) => void;
  /** 点击查看记录按钮的回调，传入当前充电桩数据 */
  onViewRecords: (charger: Charger) => void;
}

/**
 * 充电桩卡片组件
 * @description 以卡片形式展示单个充电桩的完整信息，包含位置、类型、功率说明与核实日期，提供编辑入口
 */
export function ChargerCard({ charger, onEdit, onViewRecords }: ChargerCardProps) {
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
        <Group grow>
          <Button variant="light" onClick={() => onViewRecords(charger)}>
            查看记录
          </Button>
          <Button variant="light" onClick={() => onEdit(charger)}>
            编辑
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
