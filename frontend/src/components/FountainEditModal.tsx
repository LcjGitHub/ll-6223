import { Button, Group, Modal, Stack, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import type { Fountain, FountainUpdatePayload } from '../types';

interface FountainEditModalProps {
  fountain: Fountain | null;
  opened: boolean;
  onClose: () => void;
  onSave: (id: number, payload: FountainUpdatePayload) => Promise<void>;
}

/**
 * 饮水点编辑弹窗
 */
export function FountainEditModal({
  fountain,
  opened,
  onClose,
  onSave,
}: FountainEditModalProps) {
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [waterQualityNote, setWaterQualityNote] = useState('');
  const [lastConfirmedDate, setLastConfirmedDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!fountain) return;
    setCity(fountain.city);
    setLocation(fountain.location);
    setType(fountain.type);
    setWaterQualityNote(fountain.waterQualityNote);
    setLastConfirmedDate(dayjs(fountain.lastConfirmedDate).toDate());
  }, [fountain]);

  const handleSubmit = async () => {
    if (!fountain || !lastConfirmedDate) return;
    if (!city.trim() || !location.trim() || !type.trim()) return;

    setSaving(true);
    try {
      await onSave(fountain.id, {
        city: city.trim(),
        location: location.trim(),
        type: type.trim(),
        waterQualityNote: waterQualityNote.trim(),
        lastConfirmedDate: dayjs(lastConfirmedDate).format('YYYY-MM-DD'),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="编辑饮水点" centered size="md">
      <Stack gap="md">
        <TextInput
          label="城市"
          required
          value={city}
          onChange={(e) => setCity(e.currentTarget.value)}
        />
        <TextInput
          label="位置"
          required
          value={location}
          onChange={(e) => setLocation(e.currentTarget.value)}
        />
        <TextInput
          label="类型"
          required
          value={type}
          onChange={(e) => setType(e.currentTarget.value)}
        />
        <Textarea
          label="水质备注"
          minRows={2}
          value={waterQualityNote}
          onChange={(e) => setWaterQualityNote(e.currentTarget.value)}
        />
        <DateInput
          label="最后确认日期"
          required
          value={lastConfirmedDate}
          onChange={setLastConfirmedDate}
          valueFormat="YYYY-MM-DD"
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button
            loading={saving}
            onClick={handleSubmit}
            disabled={!city.trim() || !location.trim() || !type.trim() || !lastConfirmedDate}
          >
            保存
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
