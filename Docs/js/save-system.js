// SAVE SYSTEM // local account, checkpoint, and progression persistence.
window.EchoesSave = (() => {
  const currentUserKey = "echoes-current-user";
  const accountPrefix = "echoes-account-";
  const savePrefix = "echoes-save-";

  function normalizeUsername(username) {
    return username.trim().toLowerCase();
  }

  function keyFor(prefix, username) {
    return `${prefix}${encodeURIComponent(normalizeUsername(username))}`;
  }

  function getCurrentUser() {
    return localStorage.getItem(currentUserKey);
  }

  function getAccount(username = getCurrentUser()) {
    if (!username) return null;
    const rawAccount = localStorage.getItem(keyFor(accountPrefix, username));
    return rawAccount ? JSON.parse(rawAccount) : null;
  }

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
    }
    return saveProgress(
      {
        currentPage: "introduction",
        currentLevel: 0,
        completedLevels: [],
      },
      username,
    );
  }

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
    logout,
  };
})();
