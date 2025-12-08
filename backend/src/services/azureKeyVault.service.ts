import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import NodeCache from 'node-cache';

/**
 * Azure Key Vault Service
 * 
 * Provides secure secret management with caching and fallback to environment variables.
 * Designed for Kubernetes deployment on Azure with local development support.
 */
class AzureKeyVaultService {
  private secretClient: SecretClient | null = null;
  private cache: NodeCache;
  private isEnabled: boolean = false;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private readonly CACHE_CHECK_PERIOD = 60; // 1 minute

  constructor() {
    // Initialize cache with 5-minute TTL
    this.cache = new NodeCache({
      stdTTL: this.CACHE_TTL,
      checkperiod: this.CACHE_CHECK_PERIOD,
      useClones: false,
    });

    this.initialize();
  }

  /**
   * Initialize Azure Key Vault client
   */
  private initialize(): void {
    const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    // Skip initialization if Key Vault URL is not provided (local development)
    if (!keyVaultUrl) {
      console.log('[Key Vault] Azure Key Vault URL not found. Using local .env file.');
      this.isEnabled = false;
      return;
    }

    try {
      let credential;

      // For local development with service principal
      if (process.env.AZURE_TENANT_ID && 
          process.env.AZURE_CLIENT_ID && 
          process.env.AZURE_CLIENT_SECRET) {
        credential = new ClientSecretCredential(
          process.env.AZURE_TENANT_ID,
          process.env.AZURE_CLIENT_ID,
          process.env.AZURE_CLIENT_SECRET
        );
        console.log('[Key Vault] Using ClientSecretCredential for authentication');
      } else {
        // For production (Managed Identity in AKS)
        credential = new DefaultAzureCredential();
        console.log('[Key Vault] Using DefaultAzureCredential (Managed Identity)');
      }

      this.secretClient = new SecretClient(keyVaultUrl, credential);
      this.isEnabled = true;
      console.log(`[Key Vault] Successfully initialized with URL: ${keyVaultUrl}`);
    } catch (error) {
      console.error('[Key Vault] Failed to initialize:', error);
      this.isEnabled = false;
      
      if (isProduction) {
        throw new Error('Azure Key Vault initialization failed in production environment');
      }
    }
  }

  /**
   * Get secret from Azure Key Vault with caching and fallback
   * 
   * @param secretName - Name of the secret in Key Vault (use kebab-case)
   * @param envVarName - Environment variable name as fallback
   * @returns Secret value or undefined
   */
  async getSecret(secretName: string, envVarName?: string): Promise<string | undefined> {
    // Check cache first
    const cachedValue = this.cache.get<string>(secretName);
    if (cachedValue) {
      return cachedValue;
    }

    // If Key Vault is not enabled, fallback to .env
    if (!this.isEnabled || !this.secretClient) {
      const envValue = process.env[envVarName || secretName];
      if (envValue) {
        // Cache the env value too
        this.cache.set(secretName, envValue);
      }
      return envValue;
    }

    try {
      // Fetch from Key Vault
      const secret = await this.secretClient.getSecret(secretName);
      
      if (secret.value) {
        // Cache the value
        this.cache.set(secretName, secret.value);
        return secret.value;
      }

      // Fallback to environment variable if Key Vault doesn't have it
      const envValue = process.env[envVarName || secretName];
      if (envValue) {
        this.cache.set(secretName, envValue);
      }
      return envValue;
    } catch (error) {
      console.warn(`[Key Vault] Failed to fetch secret "${secretName}":`, error);
      
      // Fallback to environment variable
      const envValue = process.env[envVarName || secretName];
      if (envValue) {
        this.cache.set(secretName, envValue);
      }
      return envValue;
    }
  }

  /**
   * Get multiple secrets at once
   * 
   * @param secrets - Array of secret configurations { keyVaultName, envVarName }
   * @returns Object with secret values
   */
  async getSecrets(secrets: Array<{ keyVaultName: string; envVarName: string }>): Promise<Record<string, string | undefined>> {
    const results: Record<string, string | undefined> = {};

    await Promise.all(
      secrets.map(async ({ keyVaultName, envVarName }) => {
        results[envVarName] = await this.getSecret(keyVaultName, envVarName);
      })
    );

    return results;
  }

  /**
   * Check if Key Vault connection is healthy
   */
  async checkHealth(): Promise<{ isHealthy: boolean; message: string }> {
    if (!this.isEnabled || !this.secretClient) {
      return {
        isHealthy: true,
        message: 'Key Vault disabled - using local environment variables',
      };
    }

    try {
      // Try to list secrets (just to check connection)
      const iterator = this.secretClient.listPropertiesOfSecrets();
      await iterator.next();

      return {
        isHealthy: true,
        message: 'Key Vault connection successful',
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: `Key Vault connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Clear cache for a specific secret or all secrets
   * 
   * @param secretName - Optional secret name to clear, if not provided clears all
   */
  clearCache(secretName?: string): void {
    if (secretName) {
      this.cache.del(secretName);
      console.log(`[Key Vault] Cache cleared for secret: ${secretName}`);
    } else {
      this.cache.flushAll();
      console.log('[Key Vault] All cache cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: this.cache.keys(),
      stats: this.cache.getStats(),
    };
  }

  /**
   * Check if Key Vault is enabled
   */
  isKeyVaultEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const azureKeyVaultService = new AzureKeyVaultService();
export default azureKeyVaultService;
