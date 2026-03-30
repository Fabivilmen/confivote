// PWA install prompt (modo simples)
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const btn = document.getElementById("btnInstalar");
  if (btn) {
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      try {
        btn.hidden = true;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } catch {
        // nada
      }
    }, { once: true });
  }
});
