import { getLogger } from './logger';
import { getRecordService } from './services/record';

export async function run() {
  const service = await getRecordService();

  getLogger().info('Purger started');

  await service.delete();
}
