/**
 * useCurrentUser - Reads the authenticated user from localStorage.
 * Returns the parsed user object or null if not logged in.
 */
export function useCurrentUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * getUserDisplayName - Returns a human-readable name for the user.
 */
export function getUserDisplayName(user) {
  if (!user) return 'Guest';
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  if (user.first_name) return user.first_name;
  return user.email || 'User';
}

/**
 * getUserInitials - Returns 2-letter initials for an avatar.
 */
export function getUserInitials(user) {
  if (!user) return '?';
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user.first_name) return user.first_name.slice(0, 2).toUpperCase();
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return '??';
}

/**
 * getUserRole - Returns a human-readable role label.
 */
export function getUserRole(user) {
  if (!user) return '';
  return user.role === 'admin' ? 'Hotel Manager' : 'Guest';
}
