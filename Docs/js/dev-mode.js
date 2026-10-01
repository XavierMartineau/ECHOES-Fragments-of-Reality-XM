(() => {
  // DEV MODE // shared authenticated navigator injected on every page.
  const script = document.currentScript;
  if (!script) {
    return;
  }

  const rootUrl = new URL("../../", script.src);
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("../css/dev-mode.css", script.src).href;
  document.head.appendChild(style);

  // Keeps the browser tab title synchronized with the current level language.
  const levelMatch = window.location.pathname.match(/niveau-(\d+)\.html$/i);
  if (levelMatch) {
    const currentLevel = String(Number(levelMatch[1])).padStart(2, "0");
    const titlePrefix =
      localStorage.getItem("echoes-language") === "en" ? "Level" : "Niveau";
    document.title = `ECHOES - ${titlePrefix} ${currentLevel}`;
  }

  const parts = [
    {
      number: 1,
      name: "Initiation",
      start: 1,
      end: 15,
      folder: "partie-1_niveau-1_à_15",
    },
    {
      number: 2,
      name: "Fractures",
      start: 16,
      end: 30,
      folder: "partie-2_niveau-16_à_30",
    },
    {
      number: 3,
      name: "Éclipse",
      start: 31,
      end: 45,
      folder: "partie-3_niveau-31_à_45",
    },
    {
      number: 4,
      name: "Resonance",
      start: 46,
      end: 60,
      folder: "partie-4_niveau-46_à_60",
    },
    {
      number: 5,
      name: "Convergence",
      start: 61,
      end: 75,
      folder: "partie-5_niveau-61_à_75",
    },
    {
      number: 6,
      name: "Last Echo",
      start: 76,
      end: 90,
      folder: "partie-6_niveau-76_à_90",
    },
  ];

  const levelLink = (level) =>
    new URL(
      `docs/html/${parts.find((part) => level >= part.start && level <= part.end).folder}/niveau-${String(level).padStart(2, "0")}.html`,
      rootUrl,
    ).href;

  const menu = document.createElement("aside");
  menu.className = "dev-mode";
  menu.innerHTML = `
    <button class="dev-mode-toggle" type="button" aria-expanded="false" aria-controls="devModePanel">
      <span class="dev-mode-icon" aria-hidden="true">☰</span>
      <span>DEV MODE</span>
    </button>
    <div class="face-id-modal" hidden role="dialog" aria-modal="true" aria-labelledby="faceIdTitle">
      <div class="face-id-card">
        <span class="face-id-logo" aria-hidden="true">◉</span>
        <span class="face-id-kicker">SECURITY CHECK</span>
        <strong id="faceIdTitle">FACE ID REQUIRED</strong>
        <p class="face-id-status">Windows Hello will verify your identity. No camera feed is shown here.</p>
        <button class="face-id-cancel" type="button">CANCEL</button>
      </div>
    </div>
    <div class="dev-mode-panel" id="devModePanel" hidden>
      <div class="dev-mode-heading">
        <div>
          <span class="dev-mode-kicker">ECHO // NAVIGATOR</span>
          <strong>Developer Access</strong>
        </div>
        <button class="dev-mode-close" type="button" aria-label="Close menu">×</button>
      </div>
      <a class="dev-mode-home" href="${new URL("index.html", rootUrl).href}">Home</a>
      <div class="dev-mode-navigation">
        <div class="dev-mode-parts">
          ${parts
            .map(
              (part) => `
                <button class="dev-mode-part-toggle" type="button" data-part="${part.number}" aria-expanded="false">
                  <span>PART ${part.number}</span>
                  <span class="dev-mode-part-name">${part.name}</span>
                  <span class="dev-mode-chevron" aria-hidden="true">›</span>
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="dev-mode-level-panel" hidden>
          ${parts
            .map(
              (part) => `
                <div class="dev-mode-level-group" data-levels-for="${part.number}" hidden>
                  <span class="dev-mode-level-title">PART ${part.number} // LEVELS</span>
                  <div class="dev-mode-levels">
                    ${Array.from(
                      { length: part.end - part.start + 1 },
                      (_, index) => {
                        const level = part.start + index;
                        return `<a href="${levelLink(level)}">${String(level).padStart(2, "0")}</a>`;
                      },
                    ).join("")}
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  const toggle = menu.querySelector(".dev-mode-toggle");
  const faceIdModal = menu.querySelector(".face-id-modal");
  const faceIdTitle = menu.querySelector("#faceIdTitle");
  const faceIdStatus = menu.querySelector(".face-id-status");
  const faceIdCancel = menu.querySelector(".face-id-cancel");
  const panel = menu.querySelector(".dev-mode-panel");
  const close = menu.querySelector(".dev-mode-close");
  const levelPanel = menu.querySelector(".dev-mode-level-panel");
  const partToggles = menu.querySelectorAll(".dev-mode-part-toggle");

  // Opens or closes the level navigator after authentication.
  const setOpen = (isOpen) => {
    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.classList.toggle("is-open", isOpen);
  };

  const toBase64 = (buffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const fromBase64 = (value) => {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(
      atob(padded + "===".slice((padded.length + 3) % 4)),
      (char) => char.charCodeAt(0),
    );
  };

  const randomBytes = (length) => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  };

  const setFaceIdStatus = (message, state = "") => {
    faceIdStatus.textContent = message;
    faceIdModal.classList.toggle("is-error", state === "error");
  };

  // Verifies the enrolled Windows Hello credential without opening a camera.
  const requestFaceId = async () => {
    faceIdModal.hidden = false;
    const isLocalDevelopmentHost = /^(localhost|127\.0\.0\.1|::1)$/i.test(
      window.location.hostname,
    );
    const storedCredential = localStorage.getItem("echoes-dev-face-credential");
    faceIdTitle.textContent = storedCredential
      ? "VERIFY OWNER FACE"
      : "OWNER FACE SETUP";
    setFaceIdStatus(
      storedCredential
        ? "Only the enrolled Windows Hello credential can unlock DEV MODE."
        : "Enroll your face now. Do not use another person for the owner setup.",
    );

    try {
      if (
        (!window.isSecureContext && !isLocalDevelopmentHost) ||
        !navigator.credentials ||
        !window.PublicKeyCredential
      ) {
        throw new Error(
          "Face ID requires HTTPS, localhost, or a local Live Server host with Windows Hello.",
        );
      }

      let credential;
      if (storedCredential) {
        credential = await navigator.credentials.get({
          publicKey: {
            challenge: randomBytes(32),
            allowCredentials: [
              { id: fromBase64(storedCredential), type: "public-key" },
            ],
            userVerification: "required",
            timeout: 60000,
          },
        });
      } else {
        credential = await navigator.credentials.create({
          publicKey: {
            challenge: randomBytes(32),
            rp: { name: "ECHOES Developer Mode" },
            user: {
              id: randomBytes(16),
              name: "echoes-owner",
              displayName: "ECHOES Owner",
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 },
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              residentKey: "required",
              userVerification: "required",
            },
            timeout: 60000,
            attestation: "none",
          },
        });
        localStorage.setItem(
          "echoes-dev-face-credential",
          toBase64(credential.rawId),
        );
      }

      if (!credential) throw new Error("Face ID verification was cancelled.");
      faceIdModal.hidden = true;
      setOpen(true);
    } catch (error) {
      const browserMessage = String(error.message || "");
      const message = browserMessage.includes("Public-key credentials")
        ? "Open ECHOES through Live Server on localhost or HTTPS to use Windows Hello."
        : browserMessage || "Face ID verification failed.";
      setFaceIdStatus(message, "error");
    }
  };

  toggle.addEventListener("click", () => {
    if (!panel.hidden) {
      setOpen(false);
      return;
    }
    requestFaceId();
  });
  close.addEventListener("click", () => setOpen(false));
  faceIdCancel.addEventListener("click", () => {
    faceIdModal.hidden = true;
  });

  // Swaps the level column while keeping the six-part menu compact.
  const showLevels = (partNumber) => {
    levelPanel.hidden = false;

    menu.querySelectorAll(".dev-mode-level-group").forEach((group) => {
      group.hidden = group.dataset.levelsFor !== partNumber;
    });

    partToggles.forEach((partToggle) => {
      const isActive = partToggle.dataset.part === partNumber;
      partToggle.setAttribute("aria-expanded", String(isActive));
      partToggle.classList.toggle("is-active", isActive);
    });
  };

  partToggles.forEach((partToggle) => {
    partToggle.addEventListener("mouseenter", () => {
      showLevels(partToggle.dataset.part);
    });
    partToggle.addEventListener("focus", () => {
      showLevels(partToggle.dataset.part);
    });
    partToggle.addEventListener("click", () => {
      showLevels(partToggle.dataset.part);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
})();
