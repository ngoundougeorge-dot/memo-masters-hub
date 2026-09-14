---
name: igloo-inc-design
description: >-
  Design system and animation guidelines inspired by Igloo Inc. (Awwwards Site of the Day).
  Features arctic/dark aesthetic, iridescent icy gradients, 3D card tilt, specular lighting,
  razor-thin grotesque typography, spring micro-interactions, and GPU-accelerated motion.
---

# Igloo Inc. Design & Motion System

Ce skill capture l'identitÃ© visuelle, l'architecture d'interaction et la direction artistique du site primÃ© **Igloo Inc.** (Awwwards Site of the Day, conÃ§u par les agences abeto et Bureaux).

Utilisez ce skill pour crÃ©er des interfaces web et PWA ultra-immersives, dynamiques, modernes et fluides Ã  60 FPS.

---

## 1. Direction Artistique & AtmosphÃ¨re ("The Iceberg Aesthetic")

L'identitÃ© d'Igloo Inc. repose sur le concept de l'iceberg :
- **Vide sidÃ©ral / Arctique mat :** ArriÃ¨re-plans profonds, noirs mats texturÃ©s, absence de noir pur plat.
- **Lueurs borÃ©ales & Iridescence :** DÃ©gradÃ©s diffus Ã©voquant des aurores borÃ©ales polaires (cyan glacier, bleu Ã©lectrique, lavande glacÃ©e, touches d'ambre polaire).
- **Verre givrÃ© & RÃ©flexions spÃ©culaires :** Panneaux glassmorphiques Ã  diffusion profonde (`backdrop-filter: blur(20px)`), avec liserÃ©s lumineux ultrafins de 1px simulant la rÃ©fraction de la lumiÃ¨re sur la glace.

### Palette Chromatique
```css
:root {
  /* ArriÃ¨re-plans sombres arctiques */
  --igloo-bg-base: #07090E;
  --igloo-bg-card: rgba(15, 23, 42, 0.65);
  --igloo-bg-elevated: rgba(30, 41, 59, 0.5);
  
  /* Lueurs & Accents glaciaires */
  --igloo-cyan: #38BDF8;
  --igloo-ice: #67E8F9;
  --igloo-electric: #3B82F6;
  --igloo-lavender: #818CF8;
  --igloo-violet: #A855F7;
  
  /* LiserÃ©s & RÃ©fractions */
  --igloo-border-subtle: rgba(255, 255, 255, 0.08);
  --igloo-border-active: rgba(103, 232, 249, 0.4);
  --igloo-specular-highlight: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.03) 100%);
  
  /* Typographie */
  --igloo-text-primary: #F8FAFC;
  --igloo-text-secondary: #94A3B8;
  --igloo-text-muted: #64748B;
  --igloo-text-ice: #E0F2FE;
}
```

---

## 2. Typographie : Razor-Thin Grotesque

- **Police de titrage :** Police gÃ©omÃ©trique ou grotesque ultra-prÃ©cise (`Inter`, `Syne`, `Space Grotesk`, ou `Geist`).
- **HiÃ©rarchie :**
  - Grands titres : Poids fins Ã  demi-gras (`font-weight: 500-700`), interlignage serrÃ© (`line-height: 1.05 - 1.15`), `letter-spacing: -0.03em`.
  - Micro-labels et tags : Capitales, taille rÃ©duite (`font-size: 0.75rem`), espacement prononcÃ© (`letter-spacing: 0.15em` / `tracking-widest`), souvent accompagnÃ©s d'un point indicateur luminescent pulsant.

---

## 3. SystÃ¨me d'Animations & Micro-Interactions

### A. Effet de Tilt 3D & LumiÃ¨re SpÃ©culaire sur les Cartes
Les cartes interagissent avec la position du curseur souris :
- Rotation lÃ©gÃ¨re en perspective (`perspective(1000px) rotateX(...) rotateY(...)`).
- Halo lumineux interne qui suit prÃ©cisÃ©ment le curseur (`radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(103, 232, 249, 0.15), transparent 70%)`).

```javascript
// Interaction 3D Card Tilt & Glow
function initIglooCards() {
  document.querySelectorAll('.igloo-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}
```

### B. Aurore BorÃ©ale d'ArriÃ¨re-Plan (Aurora Glow Mesh)
Un arriÃ¨re-plan dynamique animÃ© en continu grÃ¢ce Ã  des orbes de gradient floutÃ©s :
```css
.igloo-aurora-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
  background: var(--igloo-bg-base);
}

.igloo-aurora-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
  animation: floatOrb 18s ease-in-out infinite alternate;
}

.igloo-aurora-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #38bdf8 0%, transparent 70%);
  top: -100px;
  left: 20%;
}

.igloo-aurora-orb-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #818cf8 0%, transparent 70%);
  bottom: -150px;
  right: 15%;
  animation-duration: 22s;
  animation-delay: -5s;
}

@keyframes floatOrb {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, 40px) scale(1.15); }
  100% { transform: translate(-40px, 80px) scale(0.9); }
}
```

### C. Boutons MagnÃ©tiques & Bordures Luminescentes
- **Effet Spring :** RÃ©ponse Ã©lastique lors du clic ou du survol.
- **Shine Sweep :** Balayage lumineux diagonal au hover.
- **Badges Flottants :** Petits badges de statut avec lÃ©gÃ¨re lÃ©vitation perpÃ©tuelle (`translateY(-4px)` Ã  `translateY(4px)`).

---

## 4. Discipline de Performance & PWA
- Toujours utiliser `transform` et `opacity` pour garantir 60 FPS sur GPU.
- Appliquer `will-change: transform` uniquement sur les Ã©lÃ©ments en cours d'interaction active.
- Prendre en compte les utilisateurs sensibles aux mouvements via `prefers-reduced-motion`.

