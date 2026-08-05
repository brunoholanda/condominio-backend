import { CacheStore } from '../../application/ports/cache-store';
import { MemoryCacheStore } from './memory-cache.store';

describe('MemoryCacheStore', () => {
  let cache: CacheStore;

  beforeEach(() => {
    cache = new MemoryCacheStore();
  });

  it('distinguishes miss from cached null', async () => {
    expect(await cache.get('missing')).toBeUndefined();

    await cache.set('empty', null, 60);
    expect(await cache.get('empty')).toBeNull();
  });

  it('getOrSet only runs the factory on miss', async () => {
    let runs = 0;
    const factory = async () => {
      runs += 1;

      return { ok: true };
    };

    await expect(cache.getOrSet('k', 60, factory)).resolves.toEqual({ ok: true });
    await expect(cache.getOrSet('k', 60, factory)).resolves.toEqual({ ok: true });
    expect(runs).toBe(1);
  });

  it('del removes keys so the next read hits the factory again', async () => {
    let runs = 0;

    await cache.getOrSet('k', 60, async () => {
      runs += 1;

      return 1;
    });
    await cache.del('k');
    await cache.getOrSet('k', 60, async () => {
      runs += 1;

      return 2;
    });

    expect(runs).toBe(2);
    expect(await cache.get('k')).toBe(2);
  });
});
