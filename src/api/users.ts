import { apiClient } from './client';

export interface ApiRoleSummary {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface ApiTenantMembership {
  tenant: string;
  roles: ApiRoleSummary[];
  status: 'invited' | 'active' | 'suspended';
  rewardCredits?: number;
  relationships?: {
    parents?: string[];
    students?: string[];
  };
  parentPermissions?: {
    enabled?: boolean;
    invitedEmail?: string;
    inviteToken?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiUser {
  _id: string;
  email?: string;
  name?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    contact?: {
      email?: string;
      phone?: string;
    };
    emergencyContact?: {
      name?: string;
      relation?: string;
      email?: string;
      phone?: string;
    };
  };
  tenantMemberships: ApiTenantMembership[];
  createdAt?: string;
  updatedAt?: string;
}

export type UserListResponse = ApiUser[];

export interface InviteUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserMembershipPayload {
  rewardCredits?: number;
  status?: ApiTenantMembership['status'];
  parentIds?: string[];
  studentIds?: string[];
  parentPermissions?: ApiTenantMembership['parentPermissions'];
  roleIds?: string[];
  roleIdsToAdd?: string[];
  roleIdsToRemove?: string[];
}

export interface UpdateUserProfilePayload {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  emergencyContact?: {
    name?: string | null;
    relation?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export interface ApiUserParentSummary {
  id: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface AddParentPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export const getUsers = async (
  accessToken: string,
  tenantId: string,
): Promise<UserListResponse> => {
  return apiClient<UserListResponse>('/users', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const getUserById = async (
  accessToken: string,
  tenantId: string,
  userId: string,
): Promise<ApiUser> => {
  return apiClient<ApiUser>(`/users/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const inviteUser = async (
  accessToken: string,
  tenantId: string,
  payload: InviteUserPayload,
): Promise<ApiUser> => {
  return apiClient<ApiUser>('/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
};

export const updateUserMembership = async (
  accessToken: string,
  tenantId: string,
  userId: string,
  payload: UpdateUserMembershipPayload,
): Promise<ApiUser> => {
  return apiClient<ApiUser>(`/users/${userId}/membership`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
};

export const updateUserProfile = async (
  accessToken: string,
  tenantId: string,
  userId: string,
  payload: UpdateUserProfilePayload,
): Promise<ApiUser> => {
  return apiClient<ApiUser>(`/users/${userId}/profile`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
};

export const getUserParents = async (
  accessToken: string,
  tenantId: string,
): Promise<ApiUserParentSummary[]> => {
  return apiClient<ApiUserParentSummary[]>('/users/parents', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const addParent = async (
  accessToken: string,
  tenantId: string,
  payload: AddParentPayload,
) => {
  return apiClient<ApiUser>('/users/parents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
};
