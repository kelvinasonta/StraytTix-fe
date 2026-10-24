import apiClient from './client';
import type { 
  ApiResponse, 
  Organizer, 
  TeamMember, 
  StaffInvitation, 
  PaginatedData,
  VerificationStatusResponse,
  OrganizerVerification,
  RequestVerificationPayload 
} from '../types/api';

export const organizerApi = {
  async getMyOrganizations(): Promise<ApiResponse<Organizer[]>> {
    const { data } = await apiClient.get<ApiResponse<Organizer[]>>('/organizers');
    return data;
  },

  async createOrganization(payload: { name: string; type: 'individual' | 'organization' }): Promise<ApiResponse<Organizer>> {
    const { data } = await apiClient.post<ApiResponse<Organizer>>('/organizers', payload);
    return data;
  },

  async getOrganization(uuid: string): Promise<ApiResponse<Organizer>> {
    const { data } = await apiClient.get<ApiResponse<Organizer>>(`/organizers/${uuid}`);
    return data;
  },

  async getPublicOrganizer(slugOrUuid: string): Promise<ApiResponse<Organizer>> {
    const { data } = await apiClient.get<ApiResponse<Organizer>>(`/public/organizers/${slugOrUuid}`);
    return data;
  },

  async updateOrganization(uuid: string, payload: { name: string; type: 'individual' | 'organization'; bio?: string; website?: string; email?: string; phone?: string; logo?: string; logo_url?: string; bannerUrl?: string; banner_url?: string; cover_image?: string; cover_photo?: string; [key: string]: any }): Promise<ApiResponse<Organizer>> {
    const { data } = await apiClient.put<ApiResponse<Organizer>>(`/organizers/${uuid}`, payload);
    return data;
  },

  async deleteOrganization(uuid: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/organizers/${uuid}`);
    return data;
  },

  // Team Members (RBAC)
  async getTeamMembers(organizerUuid: string): Promise<ApiResponse<TeamMember[]>> {
    const { data } = await apiClient.get<ApiResponse<TeamMember[]>>(`/organizers/${organizerUuid}/members`);
    return data;
  },

  async addTeamMember(organizerUuid: string, payload: { email: string; role: string }): Promise<ApiResponse<TeamMember>> {
    const { data } = await apiClient.post<ApiResponse<TeamMember>>(`/organizers/${organizerUuid}/members`, payload);
    return data;
  },

  async updateMemberRole(organizerUuid: string, memberUuid: string, role: string): Promise<ApiResponse<TeamMember>> {
    const { data } = await apiClient.put<ApiResponse<TeamMember>>(`/organizers/${organizerUuid}/members/${memberUuid}`, { role });
    return data;
  },

  async updateMemberSettings(organizerUuid: string, memberUuid: string, settings: any): Promise<ApiResponse<TeamMember>> {
    const { data } = await apiClient.put<ApiResponse<TeamMember>>(`/organizers/${organizerUuid}/members/${memberUuid}/settings`, settings);
    return data;
  },

  async removeTeamMember(organizerUuid: string, memberUuid: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/organizers/${organizerUuid}/members/${memberUuid}`);
    return data;
  },

  // Staff Invitations
  async getInvitations(organizerUuid: string, page = 1): Promise<ApiResponse<PaginatedData<StaffInvitation> | StaffInvitation[]>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<StaffInvitation> | StaffInvitation[]>>(`/organizers/${organizerUuid}/invitations`, {
      params: { page }
    });
    return data;
  },

  async createInvitation(organizerUuid: string, payload: { email: string; role: string }): Promise<ApiResponse<StaffInvitation>> {
    const { data } = await apiClient.post<ApiResponse<StaffInvitation>>(`/organizers/${organizerUuid}/invitations`, payload);
    return data;
  },

  async resendInvitation(organizerUuid: string, invitationUuid: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post<ApiResponse<null>>(`/organizers/${organizerUuid}/invitations/${invitationUuid}/resend`);
    return data;
  },

  async revokeInvitation(organizerUuid: string, invitationUuid: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/organizers/${organizerUuid}/invitations/${invitationUuid}`);
    return data;
  },

  // Organizer Verification
  async getVerification(organizerUuid: string): Promise<ApiResponse<VerificationStatusResponse>> {
    const { data } = await apiClient.get<ApiResponse<VerificationStatusResponse>>(`/organizers/${organizerUuid}/verification`);
    return data;
  },

  async requestVerification(organizerUuid: string, payload: RequestVerificationPayload): Promise<ApiResponse<OrganizerVerification>> {
    const { data } = await apiClient.post<ApiResponse<OrganizerVerification>>(`/organizers/${organizerUuid}/verification`, payload);
    return data;
  },

  // Settlement Bank Accounts & Resolution
  async getBanks(): Promise<ApiResponse<Array<{ name: string; code: string; slug?: string }>>> {
    const { data } = await apiClient.get<ApiResponse<Array<{ name: string; code: string; slug?: string }>>>('/banks');
    return data;
  },

  async resolveBankAccount(payload: { account_number: string; bank_code: string }): Promise<ApiResponse<{ account_number: string; account_name: string; bank_code: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ account_number: string; account_name: string; bank_code: string }>>('/banks/resolve', payload);
    return data;
  },

  async getBankAccount(organizerUuid: string): Promise<ApiResponse<{ bank_name: string; bank_code: string; account_number: string; account_name: string; is_default: boolean } | null>> {
    const { data } = await apiClient.get<ApiResponse<{ bank_name: string; bank_code: string; account_number: string; account_name: string; is_default: boolean } | null>>(`/organizers/${organizerUuid}/bank-account`);
    return data;
  },

  async saveBankAccount(organizerUuid: string, payload: { bank_name: string; bank_code: string; account_number: string; account_name: string }): Promise<ApiResponse<{ bank_name: string; bank_code: string; account_number: string; account_name: string; is_default: boolean }>> {
    const { data } = await apiClient.post<ApiResponse<{ bank_name: string; bank_code: string; account_number: string; account_name: string; is_default: boolean }>>(`/organizers/${organizerUuid}/bank-account`, payload);
    return data;
  }
};

