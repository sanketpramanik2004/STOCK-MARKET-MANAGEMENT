const USER_EMAIL_KEY = 'stockpulse_user_email';
const USER_NAME_KEY = 'stockpulse_user_name';
const TOKEN_KEY = 'stockpulse_token';
const WALLET_KEY = 'stockpulse_wallet_balance';
const ROLE_KEY = 'stockpulse_user_role';

export const sessionService = {
  setUser: ({ email, name, token, walletBalance, role }) => {
    localStorage.setItem(USER_EMAIL_KEY, email);
    if (name) {
      localStorage.setItem(USER_NAME_KEY, name);
    }
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (walletBalance !== undefined && walletBalance !== null) {
      localStorage.setItem(WALLET_KEY, walletBalance);
    }
    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    }
  },
  getEmail: () => localStorage.getItem(USER_EMAIL_KEY) || 'demo@stockpulse.com',
  getName: () => localStorage.getItem(USER_NAME_KEY) || 'Demo Investor',
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRole: () => localStorage.getItem(ROLE_KEY) || 'USER',
  isAdmin: () => localStorage.getItem(ROLE_KEY) === 'ADMIN',
  getWalletBalance: () => Number(localStorage.getItem(WALLET_KEY) || 0),
  setWalletBalance: (walletBalance) => localStorage.setItem(WALLET_KEY, walletBalance),
  clear: () => {
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};
