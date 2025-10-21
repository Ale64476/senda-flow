// Registro del Service Worker para PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registrado:', registration);
        })
        .catch(error => {
          console.log('Error al registrar SW:', error);
        });
    });
  }
}
