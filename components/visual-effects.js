import { html } from '../files/lit-proxy.js';

import {
  toFiniteNumber,
  toPositiveNumber,
  clamp,
  layoutUnit,
  isEntityOn,
  DEFAULT_LAYOUT_BASE_WIDTH,
} from '../dh-utils.js';

const DEFAULT_FAN_ENTITY = null;

function speedToDuration(value) {
  const speed = clamp(value, 1, 100);
  return 100 / speed;
}

function ensureParticles(card, count) {
  if (!Array.isArray(card._efxParticles) || card._efxParticles.length !== count) {
    card._efxParticles = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      distMod: Math.random(),
      durMod: Math.random(),
      delayMod: Math.random(),
    }));
  }

  return card._efxParticles;
}

// Функцію getParticleCss видалено повністю! Тепер код значно легший.

export function renderVisualEffects(card, config = {}) {
  const fanEntity = config.fan_entity || DEFAULT_FAN_ENTITY;
  const fanOn = isEntityOn(card, fanEntity);

  const layoutBaseWidth = toPositiveNumber(
    config.layout_base_width,
    DEFAULT_LAYOUT_BASE_WIDTH
  );

  const color = config.efx_color ?? '#00ffff';
  const offsetY = toFiniteNumber(config.efx_offset_y, 0);

  const showFan = config.efx_fan_show ?? true;
  const fanSize = toPositiveNumber(config.efx_fan_size, 240);
  const fanOpacity = clamp(config.efx_fan_opacity, 0, 100) / 100;
  const fanDur = speedToDuration(config.efx_fan_speed);

  const showComet = config.efx_comet_show ?? true;
  const cometSize = toPositiveNumber(config.efx_comet_size, 320);
  const cometDur = speedToDuration(config.efx_comet_speed);

  const showCore = config.efx_core_show ?? true;
  const coreSize = toPositiveNumber(config.efx_core_size, 160);
  const coreDur = speedToDuration(config.efx_core_speed);

  const showParts = config.efx_part_show ?? true;
  const numParts = Math.round(clamp(config.efx_part_count, 5, 100));
  const partSpread = toPositiveNumber(config.efx_part_spread, 250);
  const partDurBase = speedToDuration(config.efx_part_speed);

  if (!fanOn) {
    return html`
      <div class="efx-layer" style="opacity: 0; transition: opacity 1s ease;"></div>
    `;
  }

  const particles = showParts ? ensureParticles(card, numParts) : [];
  const particleSizeCss = layoutUnit(3, layoutBaseWidth);
  const fanSizeCss = layoutUnit(fanSize, layoutBaseWidth);
  const cometSizeCss = layoutUnit(cometSize, layoutBaseWidth);
  const coreSizeCss = layoutUnit(coreSize, layoutBaseWidth);
  const offsetYCss = layoutUnit(offsetY, layoutBaseWidth);

  const isDragging = !!card._dragging;

  return html`
    <style>
      .efx-layer {
        position: absolute;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        pointer-events: none;
        border-radius: inherit;
        opacity: 1;
        transition: opacity 1s ease;
      }

      .efx-group {
        position: absolute;
        inset: 0;
        transform: translateY(${offsetYCss});
      }

      .is-dragging .efx-bg-fan,
      .is-dragging .efx-comet-tail,
      .is-dragging .efx-core-ring,
      .is-dragging .efx-core-glow,
      .is-dragging .efx-particle {
        animation-play-state: paused !important;
      }

      .is-dragging .efx-particles,
      .is-dragging .efx-core-glow {
        opacity: 0 !important;
        transition: opacity 0.1s ease;
      }

      .efx-bg-fan {
        position: absolute;
        top: 50%;
        left: 50%;
        display: ${showFan ? 'block' : 'block'};
        color: ${color};
        opacity: ${fanOpacity};
        --mdc-icon-size: ${fanSizeCss};
        animation: efx-bg-spin ${fanDur}s linear infinite;
      }

      .efx-comet-orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        display: ${showComet ? 'block' : 'none'};
        width: ${cometSizeCss};
        height: ${cometSizeCss};
        transform: translate(-50%, -50%);
        border-radius: 50%;
        -webkit-mask: radial-gradient(transparent 68%, black 70%);
        mask: radial-gradient(transparent 68%, black 70%);
      }

      .efx-comet-tail {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          transparent 50%,
          ${color}66 80%,
          ${color} 100%
        );
        animation: efx-rotate ${cometDur}s linear infinite;
      }

      .efx-energy-core {
        position: absolute;
        top: 50%;
        left: 50%;
        display: ${showCore ? 'block' : 'none'};
        width: ${coreSizeCss};
        height: ${coreSizeCss};
        transform: translate(-50%, -50%);
      }

      .efx-core-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px solid transparent;
        border-top-color: ${color}66;
        animation: efx-rotate ${coreDur}s linear infinite;
      }

      .efx-core-glow {
        position: absolute;
        inset: -20px;
        background: radial-gradient(circle, ${color}33 0%, transparent 60%);
        animation: efx-pulse ${coreDur}s ease-in-out infinite alternate;
        transition: opacity 0.4s ease;
      }

      .efx-particles {
        position: absolute;
        inset: 0;
        display: ${showParts ? 'block' : 'none'};
        transition: opacity 0.4s ease;
      }

      .efx-particle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${particleSizeCss};
        height: ${particleSizeCss};
        opacity: 0;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 8px 2px ${color};
      }

      @keyframes efx-bg-spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }

      @keyframes efx-rotate {
        100% { transform: rotate(360deg); }
      }

      @keyframes efx-pulse {
        0% { transform: scale(0.9); opacity: 0.5; }
        100% { transform: scale(1.2); opacity: 1; }
      }

      @keyframes efx-particle-fly {
        0% {
          transform: translate(-50%, -50%) scale(0.1);
          opacity: 0;
        }
        20% {
          opacity: 0.9;
        }
        80% {
          opacity: 0.9;
        }
        100% {
          transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(2.5);
          opacity: 0;
        }
      }
    </style>

    <div class="efx-layer ${isDragging ? 'is-dragging' : ''}">
      <div class="efx-group">
        <ha-icon icon="mdi:fan" class="efx-bg-fan"></ha-icon>

        <div class="efx-comet-orbit">
          <div class="efx-comet-tail"></div>
        </div>

        <div class="efx-energy-core">
          <div class="efx-core-glow"></div>
          <div class="efx-core-ring"></div>
        </div>

        <div class="efx-particles">
          ${showParts
            ? particles.map((p) => {
                // ОПТИМІЗАЦІЯ: Усі розрахунки відбуваються тут, а стилі вставляються інлайн
                const dist = 30 + p.distMod * partSpread;
                const dx = layoutUnit(Math.cos(p.angle) * dist, layoutBaseWidth);
                const dy = layoutUnit(Math.sin(p.angle) * dist, layoutBaseWidth);
                const duration = partDurBase + p.durMod * 2;
                const delay = -(p.delayMod * duration);

                return html`<div class="efx-particle" style="--dx: ${dx}; --dy: ${dy}; animation: efx-particle-fly ${duration}s ease-out infinite ${delay}s;"></div>`;
              })
            : html``}
        </div>
      </div>
    </div>
  `;
}