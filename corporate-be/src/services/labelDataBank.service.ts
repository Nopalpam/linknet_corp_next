import prisma from '@config/database';
import { AppError } from '../types/error.types';

const db = prisma as any;

export type LabelStatusValue = 'ACTIVE' | 'INACTIVE';
export type LocalizedText = Record<string, string>;

interface LabelNodeRecord {
  id: string;
  groupId: string;
  parentId: string | null;
  labelName: LocalizedText;
  segment: string;
  labelId: string;
  isManualLabelId: boolean;
  values: LocalizedText;
  status: LabelStatusValue;
  position: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLabelDTO {
  parentId?: string | null;
  labelId?: string | null;
  labelName?: LocalizedText;
  values?: LocalizedText;
  status?: LabelStatusValue;
}

export interface UpdateLabelDTO {
  labelName?: LocalizedText;
  labelId?: string | null;
  values?: LocalizedText;
  status?: LabelStatusValue;
}

export interface MoveLabelDTO {
  parentId?: string | null;
  position: number;
}

function slugify(value: string): string {
  let result = '';
  let lastWasSeparator = false;

  for (const char of value.trim().toLowerCase().slice(0, 120)) {
    const isAlphaNum = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9');

    if (isAlphaNum) {
      result += char;
      lastWasSeparator = false;
    } else if (!lastWasSeparator && result) {
      result += '_';
      lastWasSeparator = true;
    }
  }

  return result.endsWith('_') ? result.slice(0, -1) : result;
}

function normalizeLabelId(value: string): string {
  const nextValue = value.trim();
  if (/\s/.test(nextValue)) {
    throw new AppError('label_id must not contain spaces', 400);
  }

  const normalized = nextValue.toLowerCase();
  if (!/^[a-z0-9_]+(?:\.[a-z0-9_]+)*$/.test(normalized)) {
    throw new AppError('label_id must use lowercase dot notation, for example section.subsection.key', 400);
  }

  return normalized;
}

function suffixLabelId(labelId: string, suffix: number): string {
  const parts = labelId.split('.');
  const lastIndex = parts.length - 1;
  parts[lastIndex] = `${parts[lastIndex]}_${suffix}`;
  return parts.join('.');
}

function normalizeLabelIdForPrefix(prefix: string, groupSlug: string, value: string): string {
  const normalized = normalizeLabelId(value);
  if (normalized === prefix || normalized.startsWith(`${prefix}.`)) {
    return normalized;
  }

  const relative = normalized.startsWith(`${groupSlug}.`)
    ? normalized.slice(groupSlug.length + 1)
    : normalized;

  return `${prefix}.${relative}`;
}

function relativeLabelPath(labelId: string, prefix: string, groupSlug: string): string {
  if (labelId.startsWith(`${prefix}.`)) {
    return labelId.slice(prefix.length + 1);
  }

  if (labelId.startsWith(`${groupSlug}.`)) {
    return labelId.slice(groupSlug.length + 1);
  }

  return labelId;
}

function firstLabelName(labelName: LocalizedText): string {
  return labelName.id || labelName.en || Object.values(labelName).find(Boolean) || '';
}

function legacyLabelNameFromValues(values: LocalizedText, segment: string): LocalizedText {
  return {
    id: values.id || values.en || segment,
    en: values.en || values.id || segment,
  };
}

function normalizeLocalizedText(value: LocalizedText, fieldName: string): LocalizedText {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  const normalized = Object.fromEntries(
    Object.entries(value)
      .map(([key, text]) => [key.trim().toLowerCase(), String(text || '').trim()])
      .filter(([key, text]) => key && text)
  );

  if (Object.keys(normalized).length === 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return normalized;
}

function normalizeParagraphsToSpans(html: string): string {
  let normalized = '';
  let index = 0;

  while (index < html.length) {
    if (html[index] === '<') {
      const tagEnd = html.indexOf('>', index + 1);

      if (tagEnd === -1) {
        normalized += html.slice(index);
        break;
      }

      const tagName = html.slice(index + 1, tagEnd).trim().toLowerCase();

      if (tagName === 'p' || tagName.startsWith('p ')) {
        normalized += '<span>';
        index = tagEnd + 1;
        continue;
      }

      if (tagName === '/p') {
        normalized += '</span>';
        index = tagEnd + 1;
        continue;
      }
    }

    normalized += html[index];
    index += 1;
  }

  return normalized;
}

function normalizeLabelValues(value: LocalizedText): LocalizedText {
  const normalized = normalizeLocalizedText(value, 'values');
  return Object.fromEntries(
    Object.entries(normalized).map(([language, html]) => [
      language,
      normalizeParagraphsToSpans(html),
    ])
  );
}

function buildTree(nodes: LabelNodeRecord[]) {
  const byId = new Map<string, LabelNodeRecord & { children: LabelNodeRecord[] }>();
  nodes.forEach((node) => byId.set(node.id, { ...node, children: [] }));

  const roots: (LabelNodeRecord & { children: LabelNodeRecord[] })[] = [];
  byId.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (items: (LabelNodeRecord & { children: LabelNodeRecord[] })[]) => {
    items.sort((a, b) => a.position - b.position || a.createdAt.getTime() - b.createdAt.getTime());
    items.forEach((item) => sortNodes(item.children as any));
  };

  sortNodes(roots);
  return roots;
}

export class LabelDataBankService {
  static async getGroups(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const where = params.search
      ? { parentName: { contains: params.search, mode: 'insensitive' } }
      : {};

    const [total, data] = await Promise.all([
      db.labelGroup.count({ where }),
      db.labelGroup.findMany({
        where,
        include: { _count: { select: { labels: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: data.map((group: any) => ({
        ...group,
        totalLabels: group._count.labels,
        _count: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getGroupBySlug(slug: string) {
    const group = await db.labelGroup.findUnique({
      where: { slug },
      include: { _count: { select: { labels: true } } },
    });
    if (!group) throw new AppError('Label parent group not found', 404);
    return { ...group, totalLabels: group._count.labels, _count: undefined };
  }

  static async createGroup(parentName: string, actor?: string) {
    const name = parentName.trim();
    if (!name) throw new AppError('parent_name is required', 400);

    const slug = slugify(name);
    if (!slug) throw new AppError('parent_name must contain letters or numbers', 400);

    const existing = await db.labelGroup.findFirst({
      where: { OR: [{ parentName: { equals: name, mode: 'insensitive' } }, { slug }] },
    });
    if (existing) throw new AppError('Parent name already exists', 409);

    return db.labelGroup.create({
      data: { parentName: name, slug, createdBy: actor, updatedBy: actor },
    });
  }

  static async updateGroup(id: string, parentName: string, actor?: string) {
    const group = await db.labelGroup.findUnique({ where: { id } });
    if (!group) throw new AppError('Label parent group not found', 404);

    const name = parentName.trim();
    const slug = slugify(name);
    if (!name || !slug) throw new AppError('parent_name is required', 400);

    const duplicate = await db.labelGroup.findFirst({
      where: {
        id: { not: id },
        OR: [{ parentName: { equals: name, mode: 'insensitive' } }, { slug }],
      },
    });
    if (duplicate) throw new AppError('Parent name already exists', 409);

    const updated = await db.labelGroup.update({
      where: { id },
      data: { parentName: name, slug, updatedBy: actor },
    });

    await this.rebuildGroupLabelIds(updated.id);
    return updated;
  }

  static async deleteGroup(id: string) {
    await db.labelGroup.delete({ where: { id } });
    return { message: 'Label parent group deleted' };
  }

  static async getTree(groupSlug: string) {
    const group = await this.getGroupBySlug(groupSlug);
    const labels = await db.labelNode.findMany({
      where: { groupId: group.id },
      orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
    });
    return { group, tree: buildTree(labels) };
  }

  static async createLabel(groupSlug: string, data: CreateLabelDTO, actor?: string) {
    const group = await this.getGroupBySlug(groupSlug);
    const values = data.values ? normalizeLabelValues(data.values) : {};
    const parentId = data.parentId || null;
    const parentNode = parentId ? await this.ensureNodeInGroup(parentId, group.id) : null;
    const labelPrefix = parentNode?.labelId || group.slug;
    const manualLabelId = data.labelId
      ? normalizeLabelIdForPrefix(labelPrefix, group.slug, data.labelId)
      : null;

    const manualRelativePath = manualLabelId
      ? relativeLabelPath(manualLabelId, labelPrefix, group.slug).replace(/\./g, '_')
      : null;

    const segment = await this.ensureUniqueSegment(
      group.id,
      parentId,
      manualRelativePath ? slugify(manualRelativePath) : data.labelName ? slugify(firstLabelName(data.labelName)) : 'label'
    );
    const position = await db.labelNode.count({ where: { groupId: group.id, parentId } });
    const labelId = manualLabelId
      ? await this.ensureManualLabelIdAvailable(manualLabelId)
      : await this.ensureUniqueLabelId(await this.buildLabelId(group.slug, group.id, parentId, segment));
    const labelName = data.labelName
      ? normalizeLocalizedText(data.labelName, 'label_name')
      : legacyLabelNameFromValues(values, segment);

    return db.labelNode.create({
      data: {
        groupId: group.id,
        parentId,
        labelName,
        values,
        segment,
        labelId,
        isManualLabelId: Boolean(manualLabelId),
        status: data.status || 'ACTIVE',
        position,
        createdBy: actor,
        updatedBy: actor,
      },
    });
  }

  static async updateLabel(groupSlug: string, id: string, data: UpdateLabelDTO, actor?: string) {
    const group = await this.getGroupBySlug(groupSlug);
    const label = await this.ensureNodeInGroup(id, group.id);
    const parentNode = label.parentId ? await this.ensureNodeInGroup(label.parentId, group.id) : null;
    const labelPrefix = parentNode?.labelId || group.slug;
    const updateData: any = { updatedBy: actor };

    if (data.labelName) {
      const labelName = normalizeLocalizedText(data.labelName, 'label_name');
      updateData.labelName = labelName;
    }

    if (data.values) updateData.values = normalizeLabelValues(data.values);
    if (data.status) updateData.status = data.status;
    if (data.labelId !== undefined) {
      const manualLabelId = data.labelId
        ? normalizeLabelIdForPrefix(labelPrefix, group.slug, data.labelId)
        : null;
      if (manualLabelId) {
        updateData.labelId = await this.ensureManualLabelIdAvailable(manualLabelId, id);
        updateData.isManualLabelId = true;
      } else {
        updateData.labelId = await this.ensureUniqueLabelId(
          await this.buildLabelId(group.slug, group.id, label.parentId, label.segment),
          id
        );
        updateData.isManualLabelId = false;
      }
    }

    const updated = await db.labelNode.update({ where: { id }, data: updateData });
    if (data.labelId !== undefined) await this.rebuildGroupLabelIds(group.id);
    return updated;
  }

  static async deleteLabel(groupSlug: string, id: string) {
    const group = await this.getGroupBySlug(groupSlug);
    await this.ensureNodeInGroup(id, group.id);
    await db.labelNode.delete({ where: { id } });
    await this.normalizePositions(group.id);
    return { message: 'Label deleted' };
  }

  static async moveLabel(groupSlug: string, id: string, data: MoveLabelDTO, actor?: string) {
    const group = await this.getGroupBySlug(groupSlug);
    const label = await this.ensureNodeInGroup(id, group.id);
    const parentId = data.parentId || null;
    const oldParent = label.parentId ? await this.ensureNodeInGroup(label.parentId, group.id) : null;
    const newParent = parentId ? await this.ensureNodeInGroup(parentId, group.id) : null;

    if (parentId) {
      if (await this.isDescendant(parentId, id)) {
        throw new AppError('Cannot move a label under its own descendant', 400);
      }
    }

    const siblings = await db.labelNode.findMany({
      where: { groupId: group.id, parentId, id: { not: id } },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
    const nextPosition = Math.max(0, Math.min(data.position, siblings.length));
    const targetSegment = await this.ensureUniqueSegment(group.id, parentId, label.segment, id);
    const oldLabelId = label.labelId;
    const oldPrefix = oldParent?.labelId || group.slug;
    const newPrefix = newParent?.labelId || group.slug;
    const movingRelativePath = label.isManualLabelId
      ? relativeLabelPath(label.labelId, oldPrefix, group.slug)
      : label.segment;
    const rebasedRelativePath = targetSegment === label.segment ? movingRelativePath : targetSegment;
    const nextLabelId = label.isManualLabelId
      ? await this.ensureUniqueLabelId(`${newPrefix}.${rebasedRelativePath}`, id)
      : await this.ensureUniqueLabelId(`${newPrefix}.${targetSegment}`, id);

    await db.$transaction(async (tx: any) => {
      const reordered = [...siblings];
      reordered.splice(nextPosition, 0, { ...label, parentId, segment: targetSegment });
      await Promise.all(
        reordered.map((node, index) =>
          tx.labelNode.update({ where: { id: node.id }, data: { position: index } })
        )
      );

      await tx.labelNode.update({
        where: { id },
        data: {
          parentId,
          position: nextPosition,
          segment: targetSegment,
          labelId: nextLabelId,
          updatedBy: actor,
        },
      });
    });

    if (nextLabelId !== oldLabelId) {
      await this.replaceDescendantLabelPrefix(group.id, oldLabelId, nextLabelId);
    }

    await this.rebuildGroupLabelIds(group.id);
    return this.getTree(groupSlug);
  }

  static async getPublicLabels(language = 'id') {
    const labels = await db.labelNode.findMany({
      where: { status: 'ACTIVE' },
      select: { labelId: true, values: true },
    });

    return Object.fromEntries(
      labels.map((label: { labelId: string; values: LocalizedText }) => [
        label.labelId,
        label.values?.[language] || label.values?.id || label.values?.en || '',
      ])
    );
  }

  private static async ensureNodeInGroup(id: string, groupId: string): Promise<LabelNodeRecord> {
    const label = await db.labelNode.findFirst({ where: { id, groupId } });
    if (!label) throw new AppError('Label not found', 404);
    return label;
  }

  private static async ensureUniqueSegment(
    groupId: string,
    parentId: string | null,
    segment: string,
    ignoreId?: string
  ) {
    const baseSegment = segment || 'label';
    let candidate = baseSegment;
    let suffix = 1;

    while (
      await db.labelNode.findFirst({
        where: {
          groupId,
          parentId,
          segment: candidate,
          ...(ignoreId ? { id: { not: ignoreId } } : {}),
        },
      })
    ) {
      candidate = `${baseSegment}_${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private static async buildLabelId(
    groupSlug: string,
    groupId: string,
    parentId: string | null,
    segment: string
  ) {
    if (!parentId) return `${groupSlug}.${segment}`;
    const parent = await this.ensureNodeInGroup(parentId, groupId);
    return `${parent.labelId}.${segment}`;
  }

  private static async ensureManualLabelIdAvailable(labelId: string, ignoreId?: string) {
    const existing = await db.labelNode.findFirst({
      where: { labelId, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    });
    if (existing) throw new AppError('label_id already exists', 409);
    return labelId;
  }

  private static async ensureUniqueLabelId(labelId: string, ignoreId?: string) {
    let candidate = labelId;
    let suffix = 2;

    while (
      await db.labelNode.findFirst({
        where: { labelId: candidate, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      })
    ) {
      candidate = suffixLabelId(labelId, suffix);
      suffix += 1;
    }

    return candidate;
  }

  private static async isDescendant(nodeId: string, potentialAncestorId: string): Promise<boolean> {
    let current = await db.labelNode.findUnique({ where: { id: nodeId } });
    while (current?.parentId) {
      if (current.parentId === potentialAncestorId) return true;
      current = await db.labelNode.findUnique({ where: { id: current.parentId } });
    }
    return false;
  }

  private static async replaceDescendantLabelPrefix(
    groupId: string,
    oldPrefix: string,
    newPrefix: string
  ) {
    const descendants = await db.labelNode.findMany({
      where: {
        groupId,
        labelId: { startsWith: `${oldPrefix}.` },
      },
      orderBy: [{ labelId: 'asc' }],
    });

    for (const descendant of descendants) {
      const rebasedLabelId = `${newPrefix}${descendant.labelId.slice(oldPrefix.length)}`;
      const labelId = await this.ensureUniqueLabelId(rebasedLabelId, descendant.id);
      await db.labelNode.update({
        where: { id: descendant.id },
        data: { labelId },
      });
    }
  }

  private static async normalizePositions(groupId: string) {
    const nodes = await db.labelNode.findMany({ where: { groupId }, orderBy: [{ position: 'asc' }] });
    const parentIds = Array.from(new Set(nodes.map((node: LabelNodeRecord) => node.parentId || 'root')));

    await Promise.all(
      parentIds.flatMap((parentKey) =>
        nodes
          .filter((node: LabelNodeRecord) => (node.parentId || 'root') === parentKey)
          .sort((a: LabelNodeRecord, b: LabelNodeRecord) => a.position - b.position)
          .map((node: LabelNodeRecord, index: number) =>
            db.labelNode.update({ where: { id: node.id }, data: { position: index } })
          )
      )
    );
  }

  private static async rebuildGroupLabelIds(groupId: string) {
    const group = await db.labelGroup.findUnique({ where: { id: groupId } });
    if (!group) return;

    const nodes = await db.labelNode.findMany({
      where: { groupId },
      orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
    });
    const tree = buildTree(nodes);

    const visit = async (items: any[], prefix: string) => {
      for (const node of items) {
        const labelId = node.isManualLabelId
          ? node.labelId
          : await this.ensureUniqueLabelId(`${prefix}.${node.segment}`, node.id);
        if (!node.isManualLabelId) {
          await db.labelNode.update({ where: { id: node.id }, data: { labelId } });
        }
        await visit(node.children, labelId);
      }
    };

    await visit(tree, group.slug);
  }
}
