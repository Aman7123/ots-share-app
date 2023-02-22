import { RecordTypeEnum } from '../models/record';

export enum RecordExpirationUnitEnum {
  minutes = 'minutes',
  hours = 'hours',
}

export interface IRecordExpirationSettings {
  value: number;
  unit: RecordExpirationUnitEnum;
}

export interface ICreateRecordDto {
  content: string;
  expireIn: IRecordExpirationSettings;
  type?: RecordTypeEnum;
  mimeType?: string;
}
