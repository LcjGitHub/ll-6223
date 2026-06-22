import { Button, Group, Modal, Stack, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import type { Charger, ChargerUpdatePayload } from '../types';

interface ChargerEditModalProps {
  charger: Charger | null;
  opened: boolean;
  onClose: () => void;
  onSave: (id: number, payload: ChargerUpdatePayload) => Promise<void>;
}

export function ChargerEditModal({
  charger,
  opened,
  onClose,
  onSave,
}: ChargerEditModalProps) {
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [chargerType, setChargerType] = useState('');
  const [powerNote, setPowerNote] = useState('');
  const [lastVerifiedDate, setLastVerifiedDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!charger) return;
    setCity(charger.city);
    setLocation(charger.location);
    setChargerType(charger.chargerType);
    setPowerNote(charger.powerNote);
    setLastVerifiedDate(dayjs(charger.lastVerifiedDate).toDate());
  }, [charger]);

  const handleSubmit = async () => {
    if (!charger || !lastVerifiedDate) return;
    if (!city.trim() || !location.trim() || !chargerType.trim()) return;

    setSaving(true);
    try {
      await onSave(charger.id, {
        city: city.trim(),
        location: location.trim(),
        chargerType: chargerType.trim(),
        powerNote: powerNote.trim(),
        lastVerifiedDate: dayjs(lastVerifiedDate).format('YYYY-MM-DD'),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="编辑充电桩" centered size="md">
      <Stack gap="md">
        <TextInput
          label="城市"
          required
          value={city}
          onChange={(e) => setCity(e.currentTarget.value)}
        />
        <TextInput
          label="具体位置"
          required
          value={location}
          onChange={(e) => setLocation(e.currentTarget.value)}
        />
        <TextInput
          label="桩类型"
          required
          value={chargerType}
          onChange={(e) => setChargerType(e.currentTarget.value)}
        />
        <Textarea
          label="功率说明"
          minRows={2}
          value={powerNote}
          onChange={(e) => setPowerNote(e.currentTarget.value)}
        />
        <DateInput
          label="最后核实日期"
          required
          value={lastVerifiedDate}
          onChange={setLastVerifiedDate}
          valueFormat="YYYY-MM-DD"
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            取消
          </Button>
          <Button
            loading={saving}
            onClick={handleSubmit}
            disabled={!city.trim() || !location.trim() || !chargerType.trim() || !lastVerifiedDate}
          >
            保存
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
