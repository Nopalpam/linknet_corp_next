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

describe('Highlighting Real Initiatives schema sync', () => {
  it('normalizes legacy initiative data and remains current after syncing', () => {
    const result = syncComponentInstance('highlighting_real_initiatives', {
      _component: 'highlighting_real_initiatives',
      _schema_version: 1,
      data: {
        title: { en: 'Legacy title', id: 'Judul lama' },
        description: { en: 'Legacy description', id: 'Deskripsi lama' },
        show_intro_section: 'true',
        show_slider_section: 'false',
        show_community_section: '1',
        show_cta_section: 'yes',
        items: [{
          top_logo: '',
          image: '/legacy.jpg',
          title: 'Legacy initiative',
          desc: 'Legacy initiative description',
          date: '2026-01-02T00:00:00.000Z',
          url: '/legacy-initiative',
        }],
        community_text: 'Legacy community copy',
        community_logos: ['/legacy-logo.svg'],
      },
    });

    expect(result.wasOutdated).toBe(true);
    expect(result.latestVersion).toBe(2);
    expect(result.instance.data.show_intro_section).toBe(true);
    expect(result.instance.data.show_slider_section).toBe(false);
    expect(result.instance.data.show_community_section).toBe(true);
    expect(result.instance.data.show_cta_section).toBe(true);
    expect(result.instance.data.initiatives[0]).toMatchObject({
      source: 'manual',
      content: {
        image: '/legacy.jpg',
        title: { en: 'Legacy initiative', id: 'Legacy initiative' },
        description: { en: 'Legacy initiative description', id: 'Legacy initiative description' },
      },
      target: '_self',
    });
    expect(result.instance.data.partnerText).toEqual({
      en: 'Legacy community copy',
      id: 'Legacy community copy',
    });

    const secondSync = syncComponentInstance('highlighting_real_initiatives', result.instance);
    expect(secondSync.wasOutdated).toBe(false);
    expect(secondSync.changed).toBe(false);
    expect(secondSync.schemaDiffs).toEqual([]);
  });
});
