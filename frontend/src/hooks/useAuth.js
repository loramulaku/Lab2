import { useMemo } from 'react';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function useAuth() {
  const token = localStorage.getItem('token');
  const user  = useMemo(() => (token ? parseJwt(token) : null), [token]);

  return {
    user,
    token,
    isLoggedIn:  !!user,
    isRecruiter: user?.roles?.includes('recruiter') || user?.roles?.includes('admin'),
    isCandidate: user?.roles?.includes('candidate'),
  };
}
