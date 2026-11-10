export type FeatureFlagKey =
  // Authentication Module Flags (Laravel Pennant AuthFeature)
  | 'auth-registration'
  | 'auth-password-reset'
  | 'auth-session-management'
  | 'auth-social-login'
  | 'auth-two-factor'
  // Platform & Commerce Flags
  | 'guest_checkout'
  | 'instant_payouts'
  | 'sms_notifications'
  | 'strict_kyc'
  | 'qr_scanner_v2'
  | 'public_reviews'
  | string;

export interface FeatureFlagMeta {
  key: FeatureFlagKey;
  label: string;
  description: string;
  isActive: boolean;
  group: 'auth' | 'commerce' | 'organizer' | 'security' | 'experimental';
}

export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  // Authentication (Laravel Pennant Seeded Defaults)
  'auth-registration': true,
  'auth-password-reset': true,
  'auth-session-management': true,
  'auth-social-login': false,
  'auth-two-factor': false,

  // Commerce & Platform
  guest_checkout: true,
  instant_payouts: true,
  sms_notifications: false,
  strict_kyc: true,
  qr_scanner_v2: true,
  public_reviews: false,
};

export const FEATURE_FLAG_METADATA: Record<string, Omit<FeatureFlagMeta, 'isActive'>> = {
  'auth-registration': {
    key: 'auth-registration',
    label: 'User Registration',
    description: 'Allows public users to create new organizer or attendee accounts.',
    group: 'auth',
  },
  'auth-password-reset': {
    key: 'auth-password-reset',
    label: 'Password Reset',
    description: 'Permits self-service forgotten password emails and password reset tokens.',
    group: 'auth',
  },
  'auth-session-management': {
    key: 'auth-session-management',
    label: 'Session & Device Management',
    description: 'Enables active login devices list, remote device revocation, and session history.',
    group: 'auth',
  },
  'auth-social-login': {
    key: 'auth-social-login',
    label: 'Social / OAuth Login',
    description: 'Enables third-party authentication via Google, Apple, and social providers.',
    group: 'auth',
  },
  'auth-two-factor': {
    key: 'auth-two-factor',
    label: 'Two-Factor Auth (2FA)',
    description: 'Enforces or permits TOTP 2FA authenticator application setup and challenge prompt.',
    group: 'auth',
  },
  guest_checkout: {
    key: 'guest_checkout',
    label: 'Guest Checkout',
    description: 'Allow unauthenticated guests to purchase tickets directly without account creation.',
    group: 'commerce',
  },
  instant_payouts: {
    key: 'instant_payouts',
    label: 'Instant Settlements',
    description: 'Automated direct bank settlements on ticket sales without prolonged holds.',
    group: 'commerce',
  },
  sms_notifications: {
    key: 'sms_notifications',
    label: 'SMS Attendee Broadcasts',
    description: 'Allow organizers to send direct SMS updates to ticket holders.',
    group: 'organizer',
  },
  strict_kyc: {
    key: 'strict_kyc',
    label: 'Mandatory Organizer KYC',
    description: 'Require verified national ID / CAC business registration before launching public events.',
    group: 'security',
  },
  qr_scanner_v2: {
    key: 'qr_scanner_v2',
    label: 'High-Density Scanner V2',
    description: 'Optimized camera scanner with accelerated barcode detection for gate operations.',
    group: 'experimental',
  },
  public_reviews: {
    key: 'public_reviews',
    label: 'Attendee Reviews & Ratings',
    description: 'Display public ratings and reviews on organizer and event detail pages.',
    group: 'experimental',
  },
};

