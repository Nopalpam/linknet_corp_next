import { getDefaultValues } from '../../pageBuilder/schemaRegistry';
import { syncComponentInstance } from '../../pageBuilder/migrationEngine';

describe('Hero Static schema sync', () => {
  it('converts a legacy string gradient flag and remains current after syncing', () => {
    const legacyData = getDefaultValues('hero_section');
    legacyData.gradient_visible = 'false';

    const result = syncComponentInstance('hero_section', {
      _component: 'hero_section',
      _schema_version: 2,
      data: legacyData,
    });

    expect(result.wasOutdated).toBe(true);
    expect(result.latestVersion).toBe(3);
    expect(result.instance.data.gradient_visible).toBe(false);

    const secondSync = syncComponentInstance('hero_section', result.instance);
    expect(secondSync.wasOutdated).toBe(false);
    expect(secondSync.changed).toBe(false);
    expect(secondSync.schemaDiffs).toEqual([]);
  });
});
