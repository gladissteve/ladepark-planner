import { registry } from '../core/ObjectRegistry.js';
import { Standards } from './Standards.js';

async function init() {
  const eventBus = registry.get('eventBus');
  const standards = new Standards(eventBus);
  registry.register('standards', standards);
  await standards.reload();
  return standards;
}

export { init };
