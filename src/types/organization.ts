/**
 * Organization related types
 * 
 * Types for managing Port.io organization settings and secrets
 */

/**
 * Organization settings
 */
export interface OrganizationSettings {
  /** An array of blueprint identifiers that should be hidden */
  hiddenBlueprints?: string[];
  /** Enable federated logout */
  federatedLogout?: boolean;
  /** Portal icon */
  portalIcon?: string;
  /** Portal title */
  portalTitle?: string;
  /** Permission level for Port support users accessing this organization */
  supportUserPermission?: 'OPT_OUT' | 'OPT_IN';
  /** Time-to-live for Port support user access */
  supportUserTTL?: 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH' | 'FOREVER';
  /** Expiration date for Port support user access */
  supportUserExpiresAt?: Date | string;
}

/**
 * Organization announcement
 */
export interface OrganizationAnnouncement {
  /** Whether the announcement is enabled */
  enabled?: boolean;
  /** Announcement content */
  content?: string;
  /** Optional link URL */
  link?: string | null;
  /** Announcement color */
  color?: 'blue' | 'red';
}

/**
 * Tool selection provisioning status
 */
export interface ToolSelectionProvisioning {
  status: 'IN_PROGRESS' | 'DONE';
}

/**
 * Organization entity
 */
export interface Organization {
  /** Organization ID */
  id?: string;
  /** Organization name */
  name: string;
  /** Organization settings */
  settings?: OrganizationSettings;
  /** Whether the organization is onboarded */
  isOnboarded?: boolean;
  /** Tool selection provisioning status */
  toolSelectionProvisioning?: ToolSelectionProvisioning;
  /** Organization announcement */
  announcement?: OrganizationAnnouncement;
}

/**
 * Input for updating organization (PUT - full update)
 */
export interface UpdateOrganizationInput {
  /** The name of the organization */
  name: string;
  /** Organization settings */
  settings?: OrganizationSettings;
  /** Organization announcement */
  announcement?: OrganizationAnnouncement;
}

/**
 * Input for patching organization (PATCH - partial update)
 */
export interface PatchOrganizationInput {
  /** The name of the organization */
  name: string;
  /** Organization settings */
  settings?: OrganizationSettings;
  /** Whether the organization is onboarded */
  isOnboarded?: boolean;
  /** Tool selection provisioning status */
  toolSelectionProvisioning?: ToolSelectionProvisioning;
  /** Organization announcement */
  announcement?: OrganizationAnnouncement;
}

/**
 * Organization secret metadata
 * Note: The secret value itself is never returned by the API for security reasons
 */
export interface OrganizationSecret {
  /** The name of the secret */
  secretName: string;
  /** Optional description of the secret */
  description?: string;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Input for creating an organization secret
 */
export interface CreateSecretInput {
  /** The name of the new secret */
  secretName: string;
  /** The value of the new secret */
  secretValue: string;
  /** An optional description of the new secret */
  description?: string;
}

/**
 * Input for updating an organization secret
 */
export interface UpdateSecretInput {
  /** The new value of the secret */
  secretValue?: string;
  /** The new description of the secret */
  description?: string;
}

