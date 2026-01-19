import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FaEye, FaTrash } from 'react-icons/fa';
import { CanAccess } from '@/components/CanAccess';
import { Permission } from '@/lib/constants/permissions';
import type { ActivityLog } from '@/types/activityLog.types';
import { format } from 'date-fns';

interface ActivityLogTableProps {
  logs: ActivityLog[];
  onViewDetail: (log: ActivityLog) => void;
  onDelete: (id: string) => void;
}

export function ActivityLogTable({ logs, onViewDetail, onDelete }: ActivityLogTableProps) {
  const getActionBadge = (action: string) => {
    const variants: Record<string, string> = {
      create: 'success',
      update: 'primary',
      delete: 'danger',
      login: 'info',
      logout: 'secondary',
      read: 'light',
    };
    return variants[action.toLowerCase()] || 'secondary';
  };

  const getModuleBadge = (module: string) => {
    return 'outline-secondary';
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm:ss');
    } catch {
      return date;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p>No activity logs found</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover striped bordered>
        <thead className="table-light">
          <tr>
            <th style={{ width: '15%' }}>Date & Time</th>
            <th style={{ width: '15%' }}>User</th>
            <th style={{ width: '10%' }}>Action</th>
            <th style={{ width: '12%' }}>Module</th>
            <th style={{ width: '15%' }}>Record ID</th>
            <th style={{ width: '18%' }}>IP Address</th>
            <th style={{ width: '15%' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="align-middle">
                <small>{formatDate(log.createdAt)}</small>
              </td>
              <td className="align-middle">
                {log.user ? (
                  <div>
                    <div className="fw-bold">{log.user.username}</div>
                    <small className="text-muted">{log.user.email}</small>
                  </div>
                ) : (
                  <span className="text-muted">System</span>
                )}
              </td>
              <td className="align-middle">
                <Badge bg={getActionBadge(log.action)} className="text-uppercase">
                  {log.action}
                </Badge>
              </td>
              <td className="align-middle">
                <Badge bg={getModuleBadge(log.module)} className="text-capitalize">
                  {log.module}
                </Badge>
              </td>
              <td className="align-middle">
                {log.recordId ? (
                  <code className="text-muted small">{log.recordId.substring(0, 8)}...</code>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td className="align-middle">
                <small className="text-muted">{log.ipAddress || '-'}</small>
              </td>
              <td className="align-middle">
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onViewDetail(log)}
                    title="View Details"
                  >
                    <FaEye />
                  </Button>
                  <CanAccess permission={Permission.LOG_ACTIVITY_DELETE}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(log.id)}
                      title="Delete Log"
                    >
                      <FaTrash />
                    </Button>
                  </CanAccess>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
