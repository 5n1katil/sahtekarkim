export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch])
  );
}

export function hasInvalidChars(name) {
  return /[.#$\[\]\/]/.test(name);
}

export function resolveRoleName(role) {
  if (role === undefined || role === null) return null;
  const resolvedRole = role?.roleName ?? role?.name ?? role;
  if (resolvedRole === undefined || resolvedRole === null) return null;
  return typeof resolvedRole === "string" ? resolvedRole : String(resolvedRole);
}
