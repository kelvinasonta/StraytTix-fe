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

export interface CreditPackageOption {
  id: string;
  name: string;
  credits: number;
  price_kobo?: number;
  price_ngn?: number;
  currency?: string;
  discount_label?: string | null;
  discount_badge?: string;
  is_popular?: boolean;
  popular?: boolean;
  unit_price_desc?: string;
}

export interface CreditTopupConfigResponse {
  default_gateway: string;
  gateways: string[];
  rate_per_credit_kobo: number;
  packages?: CreditPackageOption[];
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
   * PUT /api/v1/organizers/{organizerUuid}/credits/wallet/settings
   * Updates low-balance threshold and alert configuration.
   */
  async updateWalletSettings(
    payload: { low_balance_threshold: number; low_balance_alert_enabled: boolean },
    organizerUuid?: string
  ): Promise<ApiResponse<CreditWallet>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.put<ApiResponse<CreditWallet>>(
      `/organizers/${orgUuid}/credits/wallet/settings`,
      payload
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
   * GET /api/v1/organizers/{organizerUuid}/credits/gateways
   * Returns available gateways, default gateway, rate_per_credit_kobo, and optional packages.
   */
  async getTopupConfig(organizerUuid?: string): Promise<ApiResponse<CreditTopupConfigResponse>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<CreditTopupConfigResponse>>(
      `/organizers/${orgUuid}/credits/gateways`
    );
    return data;
  },

  /**
   * GET /api/v1/organizers/{organizerUuid}/credits/packages
   * Returns backend-configured credit top-up packages.
   */
  async getPackages(organizerUuid?: string): Promise<ApiResponse<CreditPackageOption[]>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<CreditPackageOption[]>>(
      `/organizers/${orgUuid}/credits/packages`
    );
    return data;
  },

  /**
   * POST /api/v1/organizers/{organizerUuid}/credits/top-up/initialize
   * Prepares a Paystack checkout transaction for credit purchase.
   */
  async initializeTopup(
    payload: { amount_credits?: number; credits?: number; amount?: number; callback_url?: string; package_id?: string; gateway?: string },
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
      gateway: payload.gateway,
    };
    const { data } = await apiClient.post<ApiResponse<TopupInitializeResponse>>(
      `/organizers/${orgUuid}/credits/top-up/initialize`,
      body
    );
    return data;
  },

  /**
   * GET /api/v1/organizers/{organizerUuid}/credits/top-up/verify/{reference}
   * Verifies top-up payment with backend/gateway and updates wallet credits immediately.
   */
  async verifyTopup(
    reference: string,
    organizerUuid?: string,
    gateway?: string
  ): Promise<ApiResponse<{ status: string; credits_awarded: number; balance: number; reference: string }>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<{ status: string; credits_awarded: number; balance: number; reference: string }>>(
      `/organizers/${orgUuid}/credits/top-up/verify/${reference}`,
      { params: { gateway } }
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
