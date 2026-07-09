(() => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

  window.pwaInstalled = false
  window.__deferredPWAInstallPrompt = null

  if (isStandalone || localStorage.getItem('pwa_installed') === 'true') {
    window.pwaInstalled = true
    localStorage.setItem('pwa_installed', 'true')
  }

  window.addEventListener('appinstalled', () => {
    window.pwaInstalled = true
    localStorage.setItem('pwa_installed', 'true')
    window.__deferredPWAInstallPrompt = null
    window.dispatchEvent(new Event('pwa-installed'))
  })

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.__deferredPWAInstallPrompt = e
    window.dispatchEvent(new Event('pwa-installable'))
  })

  window.isInstallablePWA = function () {
    return !!window.__deferredPWAInstallPrompt
  }

  window.promptInstallPWA = async function () {
    if (!window.__deferredPWAInstallPrompt) return null
    const prompt = window.__deferredPWAInstallPrompt
    window.__deferredPWAInstallPrompt = null
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') {
      window.pwaInstalled = true
      localStorage.setItem('pwa_installed', 'true')
    }
    return choice
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    })
  }
})()
