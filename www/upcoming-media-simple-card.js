class UpcomingMediaSimpleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._isDragging = false;
    this._startX = 0;
    this._scrollLeft = 0;    
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Define entity.");
    this._config = { ...config };
    this.render();
  }

  render() {
    if (!this._config.entity || !this.hass) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="warning">No entity defined or Home Assistant not loaded.</div>
        </ha-card>
      `;
      return;
    }

    const entity = this._config.entity;
    const stateObj = this.hass.states[entity];
    if (!stateObj) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="warning">Entity not available.</div>
        </ha-card>
      `;
      return;
    }

    const data = stateObj.attributes.data;
    if (!data || data.length === 0) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="warning">No media found.</div>
        </ha-card>
      `;
      return;
    }

    if (this._lastData && JSON.stringify(this._lastData) === JSON.stringify(data)) {
      return;
    }
    this._lastData = data;

    const maxItems = this._config.max_items || 5;
    const items = data.slice(1, maxItems);

    const cardContent = items.map((item) => {
      const imageUrl = item.poster || "/local/images/placeholder.jpg";
      const title = item.title || "Unknown Title";
      const subTitle = item.episode;
      const number = item.number;

      // Détermine le type de média
      let mediaType;
      let icon;
      let imageStyle = "width: 60px; height: 90px;"; // Style par défaut (rectangle)

      if (subTitle === title || !subTitle) {
        mediaType = "movie";
        icon = "mdi:filmstrip";
      } else if (number) {
        mediaType = "series";
        icon = "mdi:television";
      } else {
        mediaType = "music";
        icon = "mdi:music";
        imageStyle = "width: 90px; height: 90px;"; // Image carrée pour les albums
      }

      // Affiche subTitle uniquement s'il est différent de title
      const showSubTitle = subTitle && subTitle !== title;
      // Affiche number uniquement s'il est différent de title et de subTitle
      const showNumber = number && number !== title && number !== subTitle;

      return `
        <div class="media-item">
          <div class="media-image-container">
            <img src="${this._resolveImageUrl(imageUrl)}" alt="${title}" class="media-image" style="${imageStyle}" />
          </div>
          <div class="media-info">
            <div class="media-title"><ha-icon icon="${icon}" class="media-icon"></ha-icon>${title}</div>
            <div class="media-episode">
              ${showSubTitle ? `${subTitle}<br/>` : ""}
              ${showNumber ? number : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");

    this.shadowRoot.innerHTML = `
      <ha-card>
        ${this._config.title ? `<div class="card-header">${this._config.title}</div>` : ""}
        <div class="card-content">
          ${cardContent}
        </div>
      </ha-card>
    `;

    const style = document.createElement("style");
    style.textContent = `
      ha-card {
        width: 100%;
        box-sizing: border-box;
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
        box-shadow: var(--ha-card-box-shadow);
      }
      .card-header {
        font-weight: bold;
        font-size: 1.2em;
        margin-bottom: 10px;
        color: var(--primary-text-color);
        padding: 0 10px;
      }
      .card-content {
        display: flex;
        gap: 10px;
        padding: 10px;
        overflow-x: auto;
        scrollbar-width: none;  /* Pour Firefox */
        -ms-overflow-style: none;  /* Pour Internet Explorer/Edge */
      }
      /* Pour Chrome/Safari */
      .card-content::-webkit-scrollbar {
        display: none;
      }        
      .media-item {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 55%;
        position: relative;
      }
      .media-image-container {
        position: relative;
      }
      .media-image {
        object-fit: cover;
        border-radius: 4px;
      }
      .media-icon {
        color: white;
        border-radius: 50%;
        width: 16px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 4px;
      }
      .media-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .media-title {
        font-weight: bold;
        font-size: 1em;
        color: var(--primary-text-color);
        display: flex;
      }
      .media-episode {
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      .warning {
        color: var(--error-color);
        padding: 10px;
      }
    `;
    this.shadowRoot.prepend(style);
    this._setupDragScrolling();
  }

  _setupDragScrolling() {
    const cardContent = this.shadowRoot.querySelector('.card-content');
    if (!cardContent) return;

    // Écouteurs pour la souris (desktop)
    cardContent.addEventListener('mousedown', (e) => this._startDrag(e, cardContent));
    cardContent.addEventListener('mousemove', (e) => this._drag(e, cardContent));
    cardContent.addEventListener('mouseup', () => this._endDrag(cardContent));
    cardContent.addEventListener('mouseleave', () => this._endDrag(cardContent));

    // Écouteurs pour le tactile (mobile)
    cardContent.addEventListener('touchstart', (e) => this._startDrag(e, cardContent), { passive: false });
    cardContent.addEventListener('touchmove', (e) => this._drag(e, cardContent), { passive: false });
    cardContent.addEventListener('touchend', () => this._endDrag(cardContent));
  }

  _startDrag(e, cardContent) {
    this._isDragging = true;
    cardContent.style.cursor = 'grabbing';
    cardContent.style.userSelect = 'none';

    // Récupère la position initiale de la souris/du toucher
    const pageX = e.pageX || e.touches[0].pageX;
    this._startX = pageX - cardContent.offsetLeft;
    this._scrollLeft = cardContent.scrollLeft;

    // Empêche le comportement par défaut pour éviter les sélections de texte
    e.preventDefault();
  }

  _drag(e, cardContent) {
    if (!this._isDragging) return;
    e.preventDefault();

    // Calcule le déplacement
    const pageX = e.pageX || e.touches[0].pageX;
    const x = pageX - cardContent.offsetLeft;
    const walk = (x - this._startX) * 2;  // Multiplié par 2 pour un défilement plus fluide

    // Applique le défilement
    cardContent.scrollLeft = this._scrollLeft - walk;
  }

  _endDrag(cardContent) {
    this._isDragging = false;
    cardContent.style.cursor = 'grab';
    cardContent.style.userSelect = '';
  }  

  _resolveImageUrl(url) {
    if (url.startsWith("http")) return url;
    const baseUrl = this.hass.hassUrl().replace(/\/$/, '');
    const imageUrl = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${imageUrl}`;
  }

  set hass(hass) {
    this._hass = hass;
    const entity = this._config.entity;
    if (!entity || !hass || !hass.states[entity]) return;
    const newData = hass.states[entity].attributes.data;
    if (!this._lastData || JSON.stringify(this._lastData) !== JSON.stringify(newData)) {
      this.render();
    }
  }

  get hass() {
    return this._hass;
  }
}

customElements.define("upcoming-media-simple-card", UpcomingMediaSimpleCard);
