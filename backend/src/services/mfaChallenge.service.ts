import { randomUUID } from 'crypto';

export type MfaProvider = 'local' | 'keycloak';

export interface MfaLoginChallenge {
  id: string;
  userId: string;
  email: string;
  password?: string;
  provider: MfaProvider;
  expiresAt: number;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const challenges = new Map<string, MfaLoginChallenge>();

export const createMfaLoginChallenge = (input: {
  userId: string;
  email: string;
  password?: string;
  provider: MfaProvider;
}): MfaLoginChallenge => {
  const challenge: MfaLoginChallenge = {
    id: randomUUID(),
    userId: input.userId,
    email: input.email,
    password: input.password,
    provider: input.provider,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  };

  challenges.set(challenge.id, challenge);
  setTimeout(() => {
    const current = challenges.get(challenge.id);
    if (current?.expiresAt === challenge.expiresAt) {
      challenges.delete(challenge.id);
    }
  }, CHALLENGE_TTL_MS).unref();

  return challenge;
};

export const getMfaLoginChallenge = (challengeId: string): MfaLoginChallenge | null => {
  const challenge = challenges.get(challengeId);
  if (!challenge) return null;

  if (challenge.expiresAt <= Date.now()) {
    challenges.delete(challengeId);
    return null;
  }

  return challenge;
};

export const clearMfaLoginChallenge = (challengeId: string): void => {
  challenges.delete(challengeId);
};
