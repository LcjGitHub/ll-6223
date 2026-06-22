export interface Charger {
  id: number;
  city: string;
  location: string;
  chargerType: string;
  powerNote: string;
  lastVerifiedDate: string;
}

export type ChargerUpdatePayload = Omit<Charger, 'id'>;
