export interface Charger {
  id: number;
  city: string;
  location: string;
  chargerType: string;
  powerNote: string;
  lastVerifiedDate: string;
}

export type ChargerUpdatePayload = Omit<Charger, 'id'>;

export interface VerificationRecord {
  id: number;
  chargerId: number;
  verificationDate: string;
  note: string;
  createdAt: string;
}

export interface VerificationRecordCreatePayload {
  verificationDate: string;
  note?: string;
}
