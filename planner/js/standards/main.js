import { registry } from '../core/ObjectRegistry.js';
import { Standards } from './Standards.js';

export async function init() {
  const eventBus = registry.get('eventBus');
  const standards = new Standards(eventBus);
  await standards.reload();
  registry.register('standards', standards);
  return standards;
}
