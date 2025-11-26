import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import type { UserRole } from '../../App';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { role, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface WithRoleProps {
  children: React.ReactNode;
  role: UserRole;
  fallback?: React.ReactNode;
}

export const AgentOnly: React.FC<Omit<WithRoleProps, 'role'>> = ({ children, fallback }) => (
  <RoleGuard allowedRoles={['agent']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ClientOnly: React.FC<Omit<WithRoleProps, 'role'>> = ({ children, fallback }) => (
  <RoleGuard allowedRoles={['client']} fallback={fallback}>
    {children}
  </RoleGuard>
);
