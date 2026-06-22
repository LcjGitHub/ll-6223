import { Alert, Button, Group, Modal, Stack, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import type { Charger, ChargerUpdatePayload } from '../types';

/**
 * 充电桩编辑弹窗组件属性
 */
interface ChargerEditModalProps {
  /** 正在编辑的充电桩数据，null 表示未选择 */
  charger: Charger | null;
  /** 弹窗是否打开 */
  opened: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 保存回调，返回 Promise，成功时 resolve，失败时 reject */
  onSave: (id: number, payload: ChargerUpdatePayload) => Promise<void>;
}

/**
 * 充电桩编辑弹窗组件
 * @description 提供表单编辑充电桩的五个字段，包含输入验证与保存状态反馈
 */
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) return;
    setError(null);
    if (!charger) return;
    setCity(charger.city);
    setLocation(charger.location);
    setChargerType(charger.chargerType);
    setPowerNote(charger.powerNote);
    setLastVerifiedDate(dayjs(charger.lastVerifiedDate).toDate());
  }, [charger, opened]);

  const handleSubmit = async () => {
    if (!charger || !lastVerifiedDate) return;
    if (!city.trim() || !location.trim() || !chargerType.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await onSave(charger.id, {
        city: city.trim(),
        location: location.trim(),
        chargerType: chargerType.trim(),
        powerNote: powerNote.trim(),
        lastVerifiedDate: dayjs(lastVerifiedDate).format('YYYY-MM-DD'),
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || '保存失败，请检查网络连接或稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="编辑充电桩" centered size="md">
      <Stack gap="md">
        {error && (
          <Alert color="red" title="保存失败" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
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
          <Button variant="default" onClick={onClose} disabled={saving}>
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
