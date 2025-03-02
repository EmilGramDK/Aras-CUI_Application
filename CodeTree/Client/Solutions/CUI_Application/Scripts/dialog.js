const styles = new CSSStyleSheet();
styles.replaceSync(`
:host {
  --background-color: #ffffff;
  --border-color: #e5e7eb;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --transition-speed: 0.25s;
  font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  color: #374151;
}
.dialog-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity var(--transition-speed),visibility var(--transition-speed)}.dialog,.dialog-header{background-color:var(--background-color);display:flex}.dialog{border-radius:16px;box-shadow:0 25px 50px -12px var(--shadow-color);max-width:80vw;max-height:80vh;overflow:hidden;overflow-y:auto;flex-direction:column;transform:scale(.95) translateY(-20px);opacity:0;transition:transform var(--transition-speed),opacity var(--transition-speed);width:var(--dialog-width,500px)}.dialog-header{justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border-color)}.dialog-title{margin:0;margin-top:4px;font-size:16px}.close-button{background:0 0;border:none;cursor:pointer;padding:5px;transition:all var(--transition-speed);border-radius:50%;display:flex;align-items:center;justify-content:center;outline:0;box-shadow:0 0 0 1px var(--border-color)}.close-button:focus,.close-button:hover{background-color:var(--shadow-color);box-shadow:0 0 0 2px var(--border-color)}.close-icon{width:16x;height:16px;transition:transform var(--transition-speed)}.close-button:hover .close-icon{transform:rotate(90deg)}.dialog-content{padding:5px 16px;overflow-y:auto;font-size:1rem;line-height:1.6}.dialog-footer{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;background-color:var(--background-color);border-top:1px solid var(--border-color)}.dialog-overlay.open{opacity:1;visibility:visible}.dialog-overlay.open .dialog{transform:scale(1) translateY(0);opacity:1}@media (max-width:640px){.dialog{width:100%;max-width:none;border-radius:16px 16px 0 0;max-height:90vh;margin-right:12px;margin-left:12px}}
`);

class AppDialog extends HTMLElement {
  width = 500;

  static define(tag = "aras-app-dialog") {
    if (customElements.get(tag)) return;
    customElements.define(tag, this);
  }

  static get observedAttributes() {
    return ["open", "width"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.resolvePromise = null;
    this.resolveResult = false;
  }

  async openDialog() {
    this.setAttribute("open", true);
    this.resolveResult = false;
    return new Promise((resolve) => (this.resolvePromise = resolve));
  }

  closeDialog(result = true) {
    this.resolveResult = result;
    this.removeAttribute("open");
  }

  connectedCallback() {
    this.shadowRoot.adoptedStyleSheets = [styles];
    this.render();
    this.#setupEvents();
    if (this.hasAttribute("open")) this.#show();
    this.width = this.getAttribute("width") || this.width;
    this.dialogOverlay.style.setProperty("--dialog-width", `${this.width}px`);
  }

  disconnectedCallback() {
    this.#cleanupEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.dialogOverlay) return;

    if (name === "open") {
      newValue === null ? this.#hide() : this.#show();
    }

    if (name === "width") {
      this.width = newValue || this.width;
      this.dialogOverlay.style.setProperty("--dialog-width", `${this.width}px`);
    }
  }

  render() {
    const title = this.getAttribute("title") || "Dialog";
    this.shadowRoot.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog">
          <div class="dialog-header">
            <h2 class="dialog-title">${title}</h2>
            <button class="close-button" aria-label="Close dialog">
              <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="dialog-content">
            <slot></slot>
          </div>
          <div class="dialog-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }

  #setupEvents() {
    this.closeButton = this.shadowRoot.querySelector(".close-button");
    this.dialogOverlay = this.shadowRoot.querySelector(".dialog-overlay");

    this.boundClose = this.#hide.bind(this);
    this.boundOverlayClick = (e) => {
      if (e.target === this.dialogOverlay || e.key === "Escape") this.#hide();
    };

    this.closeButton.addEventListener("click", this.boundClose);
    // this.dialogOverlay.addEventListener("click", this.boundOverlayClick);
    window.addEventListener("keydown", this.boundOverlayClick);
  }

  #cleanupEvents() {
    this.closeButton?.removeEventListener("click", this.boundClose);
    // this.dialogOverlay?.removeEventListener("click", this.boundOverlayClick);
    window.removeEventListener("keydown", this.boundOverlayClick);
  }

  #show() {
    this.dialogOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  #hide() {
    this.dialogOverlay.classList.remove("open");
    document.body.style.overflow = "";
    if (this.resolvePromise) {
      this.resolvePromise(this.resolveResult);
      this.resolvePromise = null;
    }
  }
}

AppDialog.define();
