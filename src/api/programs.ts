import { apiClient } from './client';

export type ApiProgramStatus = 'draft' | 'published' | 'cancelled' | 'archived';

export interface ApiProgramSchedule {
  daysOfWeek?: Array<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  >;
  startTime?: string;
  endTime?: string;
}

export interface ApiProgramDateRange {
  start: string;
  end: string;
}

export interface ApiProgramEnrollmentWindow {
  start: string;
  end: string;
}

export interface ApiProgramLocation {
  room?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface ApiProgram {
  _id: string;
  tenant: string;
  title: string;
  description?: string;
  summary?: string;
  dateRange: ApiProgramDateRange;
  schedule?: ApiProgramSchedule;
  maxEnrollments: number;
  enrollmentWindow: ApiProgramEnrollmentWindow;
  teacher?: string | null;
  location?: ApiProgramLocation;
  costCredits?: number;
  status: ApiProgramStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  cancelledAt?: string;
}

export type ProgramListResponse = ApiProgram[];

export interface ProgramListParams {
  status?: ApiProgramStatus;
  teacher?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateProgramPayload {
  title: string;
  description?: string;
  summary?: string;
  dateRange: ApiProgramDateRange;
  schedule?: ApiProgramSchedule;
  maxEnrollments: number;
  enrollmentWindow: ApiProgramDateRange;
  teacher?: string;
  location?: ApiProgramLocation;
  costCredits?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
  status?: ApiProgramStatus;
}

export type UpdateProgramPayload = Partial<CreateProgramPayload> & {
  title: string;
  dateRange: ApiProgramDateRange;
  maxEnrollments: number;
  enrollmentWindow: ApiProgramDateRange;
};

export const getPrograms = async (
  accessToken: string,
  tenantId: string,
  params?: ProgramListParams,
): Promise<ProgramListResponse> => {
  const query = new URLSearchParams();
  if (params?.status) {
    query.set('status', params.status);
  }
  if (params?.teacher) {
    query.set('teacher', params.teacher);
  }
  if (params?.dateFrom) {
    query.set('dateFrom', params.dateFrom);
  }
  if (params?.dateTo) {
    query.set('dateTo', params.dateTo);
  }

  const search = query.toString();
  const endpoint = search ? `/programs?${search}` : '/programs';

  return apiClient<ProgramListResponse>(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const createProgram = async (
  accessToken: string,
  tenantId: string,
  payload: CreateProgramPayload,
): Promise<ApiProgram> => {
  return apiClient<ApiProgram>('/programs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
};

export const getProgramById = async (
  accessToken: string,
  tenantId: string,
  programId: string,
): Promise<ApiProgram> => {
  return apiClient<ApiProgram>(`/programs/${programId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const updateProgram = async (
  accessToken: string,
  tenantId: string,
  programId: string,
  payload: UpdateProgramPayload,
): Promise<ApiProgram> => {
  return apiClient<ApiProgram>(`/programs/${programId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
};

export const publishProgram = async (
  accessToken: string,
  tenantId: string,
  programId: string,
): Promise<ApiProgram> => {
  return apiClient<ApiProgram>(`/programs/${programId}/publish`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const unpublishProgram = async (
  accessToken: string,
  tenantId: string,
  programId: string,
): Promise<ApiProgram> => {
  return apiClient<ApiProgram>(`/programs/${programId}/unpublish`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const deleteProgram = async (
  accessToken: string,
  tenantId: string,
  programId: string,
): Promise<void> => {
  await apiClient<void>(`/programs/${programId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};
