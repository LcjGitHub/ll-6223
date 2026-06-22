import {
  Alert,
  Badge,
  Button,
  Drawer,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  Timeline,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  createVerificationRecord,
  fetchChargerVerifications,
} from '../api';
import type { Charger, VerificationRecord } from '../types';

interface VerificationRecordsDrawerProps {
  charger: Charger | null;
  opened: boolean;
  onClose: () => void;
  onRecordAdded: (chargerId: number, newLastVerifiedDate: string) => void;
}

export function VerificationRecordsDrawer({
  charger,
  opened,
  onClose,
  onRecordAdded,
}: VerificationRecordsDrawerProps) {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationDate, setVerificationDate] = useState<Date | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = async () => {
    if (!charger) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChargerVerifications(charger.id);
      setRecords(data);
    } catch {
      setError('加载核实记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened && charger) {
      loadRecords();
      setVerificationDate(dayjs().toDate());
      setNote('');
    }
  }, [charger, opened]);

  const handleSubmit = async () => {
    if (!charger || !verificationDate) return;

    setSubmitting(true);
    setError(null);
    try {
      const newRecord = await createVerificationRecord(charger.id, {
        verificationDate: dayjs(verificationDate).format('YYYY-MM-DD'),
        note: note.trim(),
      });
      setRecords((prev) => [newRecord, ...prev]);
      setVerificationDate(dayjs().toDate());
      setNote('');
      onRecordAdded(charger.id, newRecord.verificationDate);
    } catch (err: any) {
      setError(err?.response?.data?.error || '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={4}>
          <Title order={4}>核实记录</Title>
          {charger && (
            <Text size="sm" c="dimmed">
              {charger.city} · {charger.location}
            </Text>
          )}
        </Stack>
      }
      position="right"
      size="lg"
      padding="lg"
    >
      <Stack gap="lg" h="100%">
        {error && (
          <Alert
            color="red"
            title="操作失败"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Stack gap="md">
          <Title order={5}>新增核实记录</Title>
          <Group grow align="flex-end">
            <DateInput
              label="核实日期"
              required
              value={verificationDate}
              onChange={setVerificationDate}
              valueFormat="YYYY-MM-DD"
              maxDate={dayjs().toDate()}
            />
          </Group>
          <Textarea
            label="核实备注"
            placeholder="描述本次核实的情况，如设备状态、充电体验等"
            minRows={3}
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button
              loading={submitting}
              onClick={handleSubmit}
              disabled={!verificationDate}
            >
              添加记录
            </Button>
          </Group>
        </Stack>

        <Stack gap="md" style={{ flex: 1, overflow: 'hidden' }}>
          <Group justify="space-between">
            <Title order={5}>历史记录</Title>
            <Badge variant="light">{records.length} 条记录</Badge>
          </Group>

          {loading ? (
            <Loader />
          ) : records.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              暂无核实记录
            </Text>
          ) : (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Timeline active={records.length - 1} bulletSize={16} lineWidth={2}>
                {records.map((record, index) => (
                  <Timeline.Item
                    key={record.id}
                    title={record.verificationDate}
                    lineVariant={index === records.length - 1 ? 'dashed' : 'solid'}
                  >
                    <Stack gap={4}>
                      <Text size="sm">
                        {record.note || (
                          <Text span c="dimmed" fs="italic">
                            无备注
                          </Text>
                        )}
                      </Text>
                      <Text size="xs" c="dimmed">
                        创建于 {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
                      </Text>
                    </Stack>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}
