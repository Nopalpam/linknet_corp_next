/**
 * gcloud-credentials.util.ts
 *
 * Utility for parsing Google Cloud service-account JSON from environment
 * variables with resilience against the encoding variations produced by
 * Azure Key Vault, GitHub/GitLab CI-CD, Docker secrets, and similar.
 *
 * Supported input formats (all resolved transparently):
 *   - Plain JSON:          {"type":"service_account","private_key":"..."}
 *   - Single-quoted:       '{"type":"service_account", ...}'
 *   - Double-quoted shell: "{"type":"service_account", ...}"
 *   - Base64-encoded:      eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwuLi59
 *   - JSON with \\n in private_key (double-escaped, common in Key Vault)
 *   - JSON with literal newlines embedded in the private_key value
 *   - Escaped double-quotes (\\") from shell or YAML serialisation
 *
 * Security note: raw credential values are NEVER included in thrown errors
 * or log output to prevent accidental secret exposure.
 */

export interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalise the private_key field after JSON.parse.
 *
 * JSON.parse turns `\n` (JSON escape) into a real newline automatically.
 * But CI-CD tooling sometimes double-escapes, leaving `\n` as two chars
 * (backslash + n) in the parsed string.  This converts those back.
 */
function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, '\n');
}

/**
 * Remove outer wrapping if the entire value is wrapped in matching
 * single-quotes (`'…'`) or double-quotes (`"…"`).
 *
 * Azure Key Vault CLI output and some Docker compose files add this layer.
 */
function stripOuterQuotes(value: string): string {
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Replace literal newline characters *inside JSON string values* with the
 * JSON escape sequence `\n`.  This repairs invalid JSON produced by tools
 * that embed the raw private-key PEM block (which has real newlines) into a
 * JSON string without escaping them.
 *
 * Strategy: only replace newlines that appear between a pair of
 * double-quote delimiters (i.e., inside a JSON string token).  Using a
 * simple character-walk so we don't need to load a full JSON tokeniser.
 */
function escapeLiteralNewlinesInJsonStrings(raw: string): string {
  let result = '';
  let insideString = false;
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i];

    if (ch === '\\' && insideString) {
      // Pass the escape sequence through unchanged (handles \", \\, \n, etc.)
      result += ch + (raw[i + 1] ?? '');
      i += 2;
      continue;
    }

    if (ch === '"') {
      insideString = !insideString;
      result += ch;
      i++;
      continue;
    }

    if (insideString && (ch === '\n' || ch === '\r')) {
      // Replace bare newline/carriage-return with the JSON escape sequence
      result += ch === '\n' ? '\\n' : '\\r';
      i++;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Attempt to parse `raw` as a `ServiceAccountCredentials` object.
 * Returns `null` if parsing fails (caller decides whether to try next
 * candidate or throw).
 */
function tryParse(raw: string): ServiceAccountCredentials | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccountCredentials>;
    if (
      typeof parsed.client_email === 'string' &&
      typeof parsed.private_key === 'string' &&
      parsed.client_email.length > 0 &&
      parsed.private_key.length > 0
    ) {
      return {
        client_email: parsed.client_email,
        private_key: normalizePrivateKey(parsed.private_key),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse `GOOGLE_SERVICE_ACCOUNT_JSON` (or any equivalent raw string) into a
 * `ServiceAccountCredentials` object suitable for passing to
 * `BetaAnalyticsDataClient` / `GoogleAuth`.
 *
 * Throws a descriptive `Error` (without exposing the raw value) when all
 * parse strategies fail.
 *
 * @param rawEnvValue - The raw string from `process.env.GOOGLE_SERVICE_ACCOUNT_JSON`
 */
export function parseGoogleServiceAccountJson(
  rawEnvValue: string
): ServiceAccountCredentials {
  // Step 1 – trim surrounding whitespace (common in multi-line env files)
  const trimmed = rawEnvValue.trim();

  // Step 2 – strip outer single/double quotes added by Key Vault / shell
  const unquoted = stripOuterQuotes(trimmed);

  // Step 3 – build a list of candidate strings to try in order of likelihood
  const candidates: Array<{ label: string; value: string }> = [
    // Most common: well-formed JSON, possibly with \\n that normalizePrivateKey handles
    { label: 'unquoted-as-is', value: unquoted },

    // CI-CD pipelines sometimes double-escape " → \"
    { label: 'unescaped-quotes', value: unquoted.replace(/\\"/g, '"') },

    // Literal newlines in PEM block inside JSON strings → escape them first
    {
      label: 'escaped-literal-newlines',
      value: escapeLiteralNewlinesInJsonStrings(unquoted),
    },

    // Combined: unescape quotes AND escape literal newlines
    {
      label: 'escaped-literal-newlines+unescaped-quotes',
      value: escapeLiteralNewlinesInJsonStrings(unquoted.replace(/\\"/g, '"')),
    },
  ];

  // Step 4 – optionally try base64 decode (Azure Key Vault "base64" type)
  try {
    const decoded = Buffer.from(unquoted, 'base64').toString('utf8');
    // Only add if the decoded string looks like JSON (starts with '{')
    if (decoded.trimStart().startsWith('{')) {
      candidates.push({ label: 'base64-decoded', value: decoded });
      candidates.push({
        label: 'base64-decoded+escaped-newlines',
        value: escapeLiteralNewlinesInJsonStrings(decoded),
      });
    }
  } catch {
    // Not valid base64 — skip silently
  }

  // Step 5 – try each candidate
  for (const { value } of candidates) {
    const result = tryParse(value);
    if (result) return result;
  }

  // Step 6 – all strategies exhausted; throw a safe, non-leaking error
  throw new Error(
    'GOOGLE_SERVICE_ACCOUNT_JSON could not be parsed. ' +
      'Verify that the environment variable contains valid service-account JSON with ' +
      '"client_email" and "private_key" fields. ' +
      'Common issues: broken \\\\n escapes in private_key, outer quote-wrapping, ' +
      'or base64 encoding without corresponding decode step.'
  );
}

/**
 * Convenience wrapper that reads directly from `process.env` and returns
 * `null` when the variable is absent (instead of throwing).  Use this to
 * gate GA4 initialisation.
 *
 * Throws when the variable is present but unparseable (surface the
 * misconfiguration early rather than silently falling back).
 */
export function readGoogleServiceAccountFromEnv(): ServiceAccountCredentials | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw || raw.trim().length === 0) return null;
  return parseGoogleServiceAccountJson(raw);
}
