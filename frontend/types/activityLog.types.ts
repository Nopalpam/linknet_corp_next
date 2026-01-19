export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  module: string;
  recordId?: string;
  oldData?: any;
  newData?: any;
  description?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  deletedAt?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  diff?: any; // JSON diff output
}

export interface ActivityLogFilters {
  search?: string;
  userId?: string;
  module?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityLogStats {
  totalLogs: number;
  actionStats: {
    action: string;
    count: number;
  }[];
  moduleStats: {
    module: string;
    count: number;
  }[];
  topUsers: {
    user: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
    };
    count: number;
  }[];
}
