import prisma from '@config/database';
import { logActivity } from './activityLogger.service';
import {
  ComponentSyncResult,
  syncComponentInstance,
  validateComponentInstance,
} from '../pageBuilder/migrationEngine';
import { getComponentSchemaRegistry } from '../pageBuilder/schemaRegistry';

interface SyncScanOptions {
  persist: boolean;
  userId?: string;
}

interface ComponentImpact {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  componentId: string;
  componentType: string;
  order: number;
  currentVersion: number;
  targetVersion: number;
  changed: boolean;
  operations: string[];
  errors: string[];
  warnings: string[];
}

interface SyncScanResult {
  dryRun: boolean;
  totalPages: number;
  totalComponents: number;
  outdatedComponents: number;
  changedComponents: number;
  failedComponents: number;
  targetVersions: Record<string, number>;
  impacts: ComponentImpact[];
  syncedAt?: string;
  syncedBy?: string;
}

function collectOperations(result: ComponentSyncResult): string[] {
  return result.logs.flatMap((entry) => (
    entry.operations.length > 0 ? entry.operations : [entry.description]
  ));
}

function buildTargetVersions() {
  return getComponentSchemaRegistry().reduce<Record<string, number>>((acc, schema) => {
    acc[schema.component] = schema.version;
    return acc;
  }, {});
}

export class ComponentSchemaSyncService {
  static async dryRun(): Promise<SyncScanResult> {
    return this.scan({ persist: false });
  }

  static async syncAll(userId?: string): Promise<SyncScanResult> {
    return this.scan({ persist: true, userId });
  }

  private static async scan(options: SyncScanOptions): Promise<SyncScanResult> {
    const pages = await prisma.page.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        components: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            data: true,
            order: true,
          },
        },
      },
    });

    const impacts: ComponentImpact[] = [];
    let totalComponents = 0;
    let changedComponents = 0;
    let failedComponents = 0;

    for (const page of pages) {
      for (const component of page.components) {
        totalComponents += 1;
        const result = syncComponentInstance(component.type, component.data, {
          persistAudit: options.persist,
          syncedBy: options.userId || 'system',
        });
        const validation = validateComponentInstance(component.type, result.instance);
        const changed = result.changed || result.wasOutdated || validation.warnings.length > 0;

        if (result.errors.length > 0 || !validation.valid) {
          failedComponents += 1;
        }

        if (changed) {
          changedComponents += 1;
          impacts.push({
            pageId: page.id,
            pageTitle: page.title,
            pageSlug: page.slug,
            componentId: component.id,
            componentType: component.type,
            order: component.order,
            currentVersion: result.originalVersion,
            targetVersion: result.latestVersion,
            changed: result.changed,
            operations: collectOperations(result),
            errors: [...result.errors, ...validation.errors],
            warnings: validation.warnings,
          });
        }

        if (options.persist && changed && result.errors.length === 0 && validation.valid) {
          await prisma.pageComponent.update({
            where: { id: component.id },
            data: { data: result.instance as any },
          });
        }
      }
    }

    const result: SyncScanResult = {
      dryRun: !options.persist,
      totalPages: pages.length,
      totalComponents,
      outdatedComponents: impacts.filter((impact) => impact.currentVersion < impact.targetVersion).length,
      changedComponents,
      failedComponents,
      targetVersions: buildTargetVersions(),
      impacts,
      ...(options.persist ? {
        syncedAt: new Date().toISOString(),
        syncedBy: options.userId || 'system',
      } : {}),
    };

    if (options.persist) {
      await logActivity({
        userId: options.userId,
        action: 'schema_sync',
        module: 'pages',
        description: `Component schema sync updated ${changedComponents} component(s).`,
        newData: {
          changedComponents,
          failedComponents,
          totalComponents,
        },
        metadata: {
          targetVersions: result.targetVersions,
          impactCount: impacts.length,
        },
      });
    }

    return result;
  }
}
