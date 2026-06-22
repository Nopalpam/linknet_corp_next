export const shouldReturnAuthTokensInBody = (): boolean =>
  process.env.AUTH_RETURN_TOKENS_IN_BODY === 'true';

export const buildAuthTokenResponse = (
  accessToken: string,
  refreshToken: string,
): { accessToken?: string; refreshToken?: string } => {
  if (!shouldReturnAuthTokensInBody()) {
    return {};
  }

  return {
    accessToken,
    refreshToken,
  };
};
