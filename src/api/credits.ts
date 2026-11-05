import { apiClient } from './client';
import { tokenStorage } from '../utils/storage';
import type { 
  ApiResponse, 
  CreditWallet, 
  CreditLedgerItem, 
  TopupInitializeResponse, 
  ReconcileWalletResponse 
} from '../types/api';

const resolveOrganizerUuid = (uuid?: string): string => {
  if (uuid && typeof uuid === 'string' && uuid.trim().length > 0) {
    return uuid.trim();
  }
  const fromStorage = tokenStorage.getActiveOrganizerUuid();
  if (fromStorage) return fromStorage;

  const cachedOrg = localStorage.getItem('strayttix_active_organizer');
  if (cachedOrg) {
    try {
      const parsed = JSON.parse(cachedOrg);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.uuid) return String(parsed.uuid);
    } catch (_) {}
  }
  throw new Error('Active organizer UUID not found. Please select an organization.');
};

export interface GetLedgerParams {
  page?: number;
  limit?: number;
  type?: string;
  reason?: string;
  search?: string;
}

export interface PaginatedLedgerResponse {
  items: CreditLedgerItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const creditsApi = {
  /**
   * GET /api/v1/organizers/{organizerUuid}/credits/wallet
   * Returns current balance, reserved balance, available balance, and version.
   */
  async getWallet(organizerUuid?: string): Promise<ApiResponse<CreditWallet>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<CreditWallet>>(
      `/organizers/${orgUuid}/credits/wallet`
    );
    return data;
  },

  /**
   * GET /api/v1/organizers/{organizerUuid}/credits/ledger
   * Returns paginated double-entry audit ledger entries.
   */
  async getLedger(
    params?: GetLedgerParams,
    organizerUuid?: string
  ): Promise<ApiResponse<PaginatedLedgerResponse | CreditLedgerItem[]>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<PaginatedLedgerResponse | CreditLedgerItem[]>>(
      `/organizers/${orgUuid}/credits/ledger`,
      { params }
    );
    return data;
  },

  /**
   * POST /api/v1/organizers/{organizerUuid}/credits/top-up/initialize
   * Prepares a Paystack checkout transaction for credit purchase.
   */
  async initializeTopup(
    payload: { amount_credits?: number; credits?: number; amount?: number; callback_url?: string; package_id?: string },
    organizerUuid?: string
  ): Promise<ApiResponse<TopupInitializeResponse>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const creditsAmount = payload.credits ?? payload.amount_credits ?? 100;
    const body = {
      credits: creditsAmount,
      amount_credits: creditsAmount,
      amount: creditsAmount * 10,
      callback_url: payload.callback_url,
      package_id: payload.package_id,
    };
    const { data } = await apiClient.post<ApiResponse<TopupInitializeResponse>>(
      `/organizers/${orgUuid}/credits/top-up/initialize`,
      body
    );
    return data;
  },

  /**
   * GET /api/v1/organizers/{organizerUuid}/credits/reconcile
   * Runs double-entry ledger invariant verification against the recorded wallet balance.
   */
  async reconcileWallet(organizerUuid?: string): Promise<ApiResponse<ReconcileWalletResponse>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<ReconcileWalletResponse>>(
      `/organizers/${orgUuid}/credits/reconcile`
    );
    return data;
  }
};
