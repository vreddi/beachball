import { getScopedPackages } from '../../monorepo/getScopedPackages';
import { BeachballOptions } from '../../types/BeachballOptions';
import { MonoRepoFactory } from '../../fixtures/monorepo';
import { Repository } from '../../fixtures/repository';

describe('getScopedPackages', () => {
  let repoFactory: MonoRepoFactory;
  let repo: Repository;

  beforeAll(async () => {
    repoFactory = new MonoRepoFactory();
    await repoFactory.create();
    repo = await repoFactory.cloneRepository();
  });
  afterAll(async () => {
    await repoFactory.cleanUp();
  });

  it('can scope packages', async () => {
    const scopedPackages = getScopedPackages({
      path: repo.rootPath,
      scope: ['packages/grouped/*'],
    } as BeachballOptions);

    expect(scopedPackages.has('a')).toBeTruthy();
    expect(scopedPackages.has('b')).toBeTruthy();

    expect(scopedPackages.has('foo')).toBeFalsy();
    expect(scopedPackages.has('bar')).toBeFalsy();
  });

  it('can scope with excluded packages', async () => {
    const scopedPackages = getScopedPackages({
      path: repo.rootPath,
      scope: ['!packages/grouped/*'],
    } as BeachballOptions);

    expect(scopedPackages.has('a')).toBeFalsy();
    expect(scopedPackages.has('b')).toBeFalsy();

    expect(scopedPackages.has('foo')).toBeTruthy();
    expect(scopedPackages.has('bar')).toBeTruthy();
  });

  it('can mix and match with excluded packages', async () => {
    const scopedPackages = getScopedPackages({
      path: repo.rootPath,
      scope: ['packages/b*', '!packages/grouped/*'],
    } as BeachballOptions);

    expect(scopedPackages.has('a')).toBeFalsy();
    expect(scopedPackages.has('b')).toBeFalsy();

    expect(scopedPackages.has('foo')).toBeFalsy();
    expect(scopedPackages.has('bar')).toBeTruthy();
  });
});
