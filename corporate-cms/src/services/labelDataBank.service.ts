import { BaseService } from "./base.service";

export type LabelStatus = "ACTIVE" | "INACTIVE";
export type LocalizedText = Record<string, string>;

export interface LabelGroup {
  id: string;
  parentName: string;
  slug: string;
  totalLabels: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabelNode {
  id: string;
  groupId: string;
  parentId?: string | null;
  labelName: LocalizedText;
  segment: string;
  labelId: string;
  isManualLabelId: boolean;
  values: LocalizedText;
  status: LabelStatus;
  position: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  children: LabelNode[];
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class LabelDataBankService extends BaseService {
  private baseUrl = "/cms/labels";

  async getGroups(params?: { page?: number; limit?: number; search?: string }): Promise<ListResponse<LabelGroup>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}?${query.toString()}`));
  }

  async createGroup(parentName: string): Promise<{ success: boolean; data: LabelGroup }> {
    return this.fetchWithAuth(this.getApiUrl(this.baseUrl), {
      method: "POST",
      body: JSON.stringify({ parent_name: parentName }),
    });
  }

  async updateGroup(id: string, parentName: string): Promise<{ success: boolean; data: LabelGroup }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${id}`), {
      method: "PUT",
      body: JSON.stringify({ parent_name: parentName }),
    });
  }

  async deleteGroup(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${id}`), { method: "DELETE" });
  }

  async getTree(parent: string): Promise<{ success: boolean; data: { group: LabelGroup; tree: LabelNode[] } }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${parent}/tree`));
  }

  async createLabel(
    parent: string,
    data: { parentId?: string | null; labelId?: string; values: LocalizedText; status: LabelStatus }
  ): Promise<{ success: boolean; data: LabelNode }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${parent}/tree`), {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLabel(
    parent: string,
    id: string,
    data: { labelId?: string; values: LocalizedText; status: LabelStatus }
  ): Promise<{ success: boolean; data: LabelNode }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${parent}/tree/${id}`), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async moveLabel(
    parent: string,
    id: string,
    data: { parentId?: string | null; position: number }
  ): Promise<{ success: boolean; data: { group: LabelGroup; tree: LabelNode[] } }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${parent}/tree/${id}/move`), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteLabel(parent: string, id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`${this.baseUrl}/${parent}/tree/${id}`), { method: "DELETE" });
  }
}

export const labelDataBankService = new LabelDataBankService();
