// lib/utils.js
export function formaterDato(dato) {
    return new Date(dato).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  export function formaterTid(dato) {
    return new Date(dato).toLocaleTimeString('no-NO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  export function validerEpost(epost) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(epost)
  }
  
  export function validerAlder(alder) {
    return alder >= 25 && alder <= 40
  }
  
  export function genererInvitasjonKode() {
    return Math.random().toString(36).substr(2, 9).toUpperCase()
  }
  
  export function blokerSkjermbilder() {
    if (typeof window !== 'undefined') {
      // Prøv å blokkere screenshots (virker bare på noen platformer)
      document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
          navigator.clipboard.writeText('')
          alert('Screenshots er ikke tillatt av personvernhensyn.')
        }
      })
  
      // Blur innhold når fane ikke er aktiv
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          document.body.style.filter = 'blur(5px)'
        } else {
          document.body.style.filter = 'none'
        }
      })
    }
  }