export const ACTIVE_PLAYER_KEYS = ["active", "connected", "isOnline"];

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

export function detectActivePlayerKey(playersObj) {
  const players = Object.values(playersObj || {});
  for (const key of ACTIVE_PLAYER_KEYS) {
    if (players.some((p) => p && typeof p === "object" && key in p)) {
      return key;
    }
  }
  return null;
}

export function isPlayerActive(playerEntry, activeKey) {
  if (!playerEntry || typeof playerEntry !== "object") return true;
  const key = activeKey || ACTIVE_PLAYER_KEYS.find((k) => k in playerEntry);
  if (!key) return true;
  return Boolean(playerEntry[key]);
}

export function getActivePlayers(playerRoles, playersObj) {
  const players = playersObj || {};
  const roles = playerRoles || {};
  const activeKey = detectActivePlayerKey(players);

  return Object.keys(roles)
    .map((uid) => {
      const playerEntry = players[uid] || {};
      if (!isPlayerActive(playerEntry, activeKey)) return null;
      return {
        uid,
        name: playerEntry?.name || uid,
      };
    })
    .filter(Boolean);
}
