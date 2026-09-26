export function validateAdminLogin(username, password) {
  if (!username.trim() || !password) {
    return 'Username and password are required.';
  }

  return '';
}
