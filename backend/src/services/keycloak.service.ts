type KeycloakTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type KeycloakUser = {
  id: string;
  username?: string;
  email?: string;
  enabled?: boolean;
  requiredActions?: string[];
};

type KeycloakCredential = {
  id: string;
  type: string;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const getKeycloakConfig = () => {
  const url = process.env.KEYCLOAK_URL?.trim();
  const realm = process.env.KEYCLOAK_REALM?.trim();
  const clientId = process.env.KEYCLOAK_CLIENT_ID?.trim();
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET?.trim();

  return {
    url: url ? trimTrailingSlash(url) : '',
    realm: realm || '',
    clientId: clientId || '',
    clientSecret: clientSecret || '',
    adminUser: process.env.KEYCLOAK_ADMIN_USER?.trim() || '',
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || '',
  };
};

export const isKeycloakConfigured = (): boolean => {
  const config = getKeycloakConfig();
  return Boolean(config.url && config.realm && config.clientId && config.clientSecret);
};

export const getKeycloakRealmUrl = (): string | null => {
  const config = getKeycloakConfig();
  if (!config.url || !config.realm) return null;
  return `${config.url}/realms/${encodeURIComponent(config.realm)}`;
};

const formEncode = (data: Record<string, string>): URLSearchParams => {
  const form = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value) form.set(key, value);
  });
  return form;
};

const requestToken = async (body: Record<string, string>): Promise<KeycloakTokenResponse> => {
  const realmUrl = getKeycloakRealmUrl();
  if (!realmUrl) {
    throw new Error('Keycloak realm is not configured');
  }

  const response = await fetch(`${realmUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formEncode(body),
  });

  const data = (await response.json().catch(() => ({}))) as KeycloakTokenResponse;

  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Keycloak authentication failed');
  }

  return data;
};

export const verifyPasswordAndOtp = async (input: {
  username: string;
  password: string;
  otp: string;
}): Promise<boolean> => {
  const config = getKeycloakConfig();
  if (!isKeycloakConfigured()) {
    throw new Error('Keycloak is not configured');
  }

  await requestToken({
    grant_type: 'password',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    username: input.username,
    password: input.password,
    totp: input.otp,
  });

  return true;
};

const getAdminAccessToken = async (): Promise<string> => {
  const config = getKeycloakConfig();

  if (!isKeycloakConfigured()) {
    throw new Error('Keycloak is not configured');
  }

  const clientCredentials = await requestToken({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
  }).catch(() => null);

  if (clientCredentials?.access_token) {
    return clientCredentials.access_token;
  }

  if (!config.adminUser || !config.adminPassword) {
    throw new Error('Keycloak admin credentials are not configured');
  }

  const passwordGrant = await requestToken({
    grant_type: 'password',
    client_id: 'admin-cli',
    username: config.adminUser,
    password: config.adminPassword,
  });

  if (!passwordGrant.access_token) {
    throw new Error('Keycloak admin token was not returned');
  }

  return passwordGrant.access_token;
};

const adminFetch = async <T>(path: string): Promise<T> => {
  const config = getKeycloakConfig();
  const token = await getAdminAccessToken();
  const response = await fetch(
    `${config.url}/admin/realms/${encodeURIComponent(config.realm)}${path}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Keycloak admin request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const findUserByEmail = async (email: string): Promise<KeycloakUser | null> => {
  const users = await adminFetch<KeycloakUser[]>(
    `/users?email=${encodeURIComponent(email)}&exact=true`
  );

  return users[0] || null;
};

export const getUserCredentials = async (userId: string): Promise<KeycloakCredential[]> => {
  return adminFetch<KeycloakCredential[]>(`/users/${encodeURIComponent(userId)}/credentials`);
};

export const getUserMfaStatus = async (email: string): Promise<{
  mfaEnabled: boolean;
  hasMfaSecret: boolean;
  managedByRealm: boolean;
}> => {
  const user = await findUserByEmail(email);
  if (!user) {
    return { mfaEnabled: false, hasMfaSecret: false, managedByRealm: true };
  }

  const credentials = await getUserCredentials(user.id);
  const hasOtp = credentials.some((credential) => credential.type === 'otp');
  const mustConfigureOtp = user.requiredActions?.includes('CONFIGURE_TOTP') === true;

  return {
    mfaEnabled: hasOtp && user.enabled !== false && !mustConfigureOtp,
    hasMfaSecret: hasOtp,
    managedByRealm: true,
  };
};

export const isOtpRequiredForUser = async (email: string): Promise<boolean> => {
  const status = await getUserMfaStatus(email);
  return status.mfaEnabled;
};

export default {
  getKeycloakConfig,
  isKeycloakConfigured,
  getKeycloakRealmUrl,
  verifyPasswordAndOtp,
  findUserByEmail,
  getUserCredentials,
  getUserMfaStatus,
  isOtpRequiredForUser,
};
