'use client';

import { Badge } from 'react-bootstrap';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'SUSPENDED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'SUSPENDED':
        return 'Suspended';
      default:
        return status;
    }
  };

  return (
    <Badge bg={getVariant()} className={className}>
      {getLabel()}
    </Badge>
  );
}
