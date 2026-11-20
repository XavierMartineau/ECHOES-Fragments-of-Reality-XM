(() => {
  const currentScript = document.currentScript;
  if (!currentScript) return;
  const controller = document.createElement("script");
  controller.src = new URL("boss-02.js", currentScript.src).href;
  document.body.appendChild(controller);
})();
