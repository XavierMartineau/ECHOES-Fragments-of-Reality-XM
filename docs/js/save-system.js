// SAVE SYSTEM // local account, checkpoint, and progression persistence.
window.EchoesSave = (() => {
  const currentUserKey = "echoes-current-user";
  const accountPrefix = "echoes-account-";
  const savePrefix = "echoes-save-";

  // Normalise le nom de joueur.
  function normalizeUsername(username) {
    return username.trim().toLowerCase();
  }

  // Construit la clé de stockage local d'un joueur.
  function keyFor(prefix, username) {
    return `${prefix}${encodeURIComponent(normalizeUsername(username))}`;
  }

  // Renvoie le joueur connecté.
  function getCurrentUser() {
    return localStorage.getItem(currentUserKey);
  }

  // Lit le compte d'un joueur.
  function getAccount(username = getCurrentUser()) {
    if (!username) return null;
    const rawAccount = localStorage.getItem(keyFor(accountPrefix, username));
    return rawAccount ? JSON.parse(rawAccount) : null;
  }

  // Connecte un joueur ou crée son compte.
  function loginOrCreate(username, password) {
    const normalizedUsername = normalizeUsername(username);
    const accountKey = keyFor(accountPrefix, normalizedUsername);
    const existingAccount = localStorage.getItem(accountKey);

    if (existingAccount) {
      const account = JSON.parse(existingAccount);
      if (account.password !== password) {
        return { ok: false, reason: "password" };
      }
    } else {
      localStorage.setItem(
        accountKey,
        JSON.stringify({ username: normalizedUsername, password }),
      );
    }

    localStorage.setItem(currentUserKey, normalizedUsername);
    return { ok: true, username: normalizedUsername, isNew: !existingAccount };
  }

  // Lit la sauvegarde d'un joueur.
  function getSave(username = getCurrentUser()) {
    if (!username) return null;
    const rawSave = localStorage.getItem(keyFor(savePrefix, username));
    return rawSave ? JSON.parse(rawSave) : null;
  }

  // Merges the latest level state into the active account checkpoint.
  function saveProgress(progress, username = getCurrentUser()) {
    if (!username) return false;
    const previousSave = getSave(username) || {};
    const nextSave = {
      ...previousSave,
      ...progress,
      username: normalizeUsername(username),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      keyFor(savePrefix, username),
      JSON.stringify(nextSave),
    );
    return true;
  }

  // Supprime la sauvegarde d'un joueur.
  function deleteSave(username = getCurrentUser()) {
    if (!username) return false;
    localStorage.removeItem(keyFor(savePrefix, username));
    return true;
  }

  // Clears the old run before starting the introduction again.
  function startNewGame(username = getCurrentUser()) {
    if (username) {
      localStorage.removeItem(keyFor("echoes-completed-levels-", username));
      localStorage.removeItem("echoes-completed-levels");
    } else {
      localStorage.removeItem("echoes-guest-keys");
    }
    return saveProgress(
      {
        currentPage: "introduction",
        currentLevel: 0,
        completedLevels: [],
        keys: [],
      },
      username,
    );
  }

  // Lit les clés obtenues par un joueur.
  function getKeys(username = getCurrentUser()) {
    if (!username) {
      return JSON.parse(localStorage.getItem("echoes-guest-keys") || "[]");
    }
    return getSave(username)?.keys || [];
  }

  // Débloque une clé pour un joueur.
  function unlockKey(keyId, username = getCurrentUser()) {
    if (!keyId) return false;
    let unlocked = false;
    if (!username) {
      const guestKeys = JSON.parse(localStorage.getItem("echoes-guest-keys") || "[]");
      const keys = [...new Set(guestKeys.concat(keyId))];
      localStorage.setItem("echoes-guest-keys", JSON.stringify(keys));
      unlocked = true;
    } else {
      const keys = [...new Set(getKeys(username).concat(keyId))];
      unlocked = saveProgress({ keys }, username);
    }
    if (unlocked) {
      document.dispatchEvent(new CustomEvent("echoes:key-unlocked", { detail: { keyId } }));
    }
    return unlocked;
  }

  // Déconnecte le joueur.
  function logout() {
    localStorage.removeItem(currentUserKey);
  }

  return {
    getCurrentUser,
    getAccount,
    getSave,
    loginOrCreate,
    saveProgress,
    deleteSave,
    startNewGame,
    getKeys,
    unlockKey,
    logout,
  };
})();
