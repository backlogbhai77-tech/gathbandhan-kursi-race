export class OrientationGuide {
  constructor() {
    this.guide = document.querySelector('#orientation-guide');
    this.button = document.querySelector('#orientation-btn');
    this.isMobile = window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.button?.addEventListener('click', () => this.requestLandscape());
    this.update();
    window.addEventListener('resize', () => this.update());
    window.addEventListener('orientationchange', () => this.update());
    screen.orientation?.addEventListener?.('change', () => this.update());
  }

  isLandscape() {
    return window.innerWidth > window.innerHeight;
  }

  update() {
    if (!this.guide) return;
    const show = this.isMobile && !this.isLandscape();
    this.guide.classList.toggle('is-visible', show);
    document.body.classList.toggle('needs-landscape', show);
  }

  async requestLandscape() {
    // Browsers only permit orientation locking after a user gesture,
    // and support differs by browser/device. Never block manual rotation.
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation?.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (_) {
      // Unsupported or denied: the animated guide remains and manual
      // device rotation will dismiss it through the orientation listeners.
    }
    this.update();
  }
}
