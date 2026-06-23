/**
 * pwa-install.js
 * Banner de instalação PWA customizado.
 * - Android/Chrome: captura o evento beforeinstallprompt e oferece instalação com 1 toque
 * - iOS/Safari: mostra instruções manuais para "Adicionar à Tela de Início"
 */

const PWA_DISMISSED_KEY = '@FronteiraPlus:pwa_dismissed';
const PWA_INSTALLED_KEY = '@FronteiraPlus:pwa_installed';
const SHOW_DELAY_MS = 3500; // Aguarda 3.5s antes de mostrar o banner

let deferredPrompt = null; // Armazena o evento beforeinstallprompt

// ─────────────────────────────────────────────
// Detecção de plataforma
// ─────────────────────────────────────────────
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

// ─────────────────────────────────────────────
// Criação do HTML do Banner
// ─────────────────────────────────────────────
function createBannerHTML(isIOSDevice) {
    const iosInstructions = `
        <p class="pwa-banner-subtitle">
            Toque em <strong><span class="pwa-ios-share-icon">⎙</span> Compartilhar</strong> 
            e depois em <strong>"Adicionar à Tela de Início"</strong>
        </p>`;

    const androidButton = `
        <button id="pwa-install-btn" class="pwa-install-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                <path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V128a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66Z"/>
            </svg>
            Instalar App
        </button>`;

    return `
    <div id="pwa-install-banner" class="pwa-install-banner" role="dialog" aria-label="Instalar aplicativo">
        <div class="pwa-banner-inner">
            <div class="pwa-banner-left">
                <div class="pwa-app-icon">
                    <img src="images/icons/launchericon-192x192.png" alt="Fronteira+" width="44" height="44">
                </div>
                <div class="pwa-banner-text">
                    <p class="pwa-banner-title">Fronteira<span>Plus</span></p>
                    ${isIOSDevice ? iosInstructions : '<p class="pwa-banner-subtitle">Instale grátis e acesse sem precisar do navegador.</p>'}
                </div>
            </div>
            <div class="pwa-banner-actions">
                ${isIOSDevice ? '' : androidButton}
                <button id="pwa-dismiss-btn" class="pwa-dismiss-btn" aria-label="Fechar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
                    </svg>
                </button>
            </div>
        </div>
        ${isIOSDevice ? '<div class="pwa-ios-arrow">▼</div>' : ''}
    </div>`;
}

// ─────────────────────────────────────────────
// CSS injetado dinamicamente
// ─────────────────────────────────────────────
function injectStyles() {
    if (document.getElementById('pwa-install-styles')) return;

    const style = document.createElement('style');
    style.id = 'pwa-install-styles';
    style.textContent = `
        #pwa-install-banner {
            position: fixed;
            bottom: 80px; /* acima da nav bar */
            left: 12px;
            right: 12px;
            z-index: 9999;
            border-radius: 20px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(14,165,233,0.15);
            padding: 14px 16px;
            transform: translateY(140%);
            opacity: 0;
            transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
            will-change: transform, opacity;
        }

        #pwa-install-banner.is-visible {
            transform: translateY(0);
            opacity: 1;
        }

        #pwa-install-banner.is-hiding {
            transform: translateY(140%);
            opacity: 0;
        }

        .pwa-banner-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .pwa-banner-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        .pwa-app-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            overflow: hidden;
            flex-shrink: 0;
            background: #1e40af;
            border: 1.5px solid rgba(255,255,255,0.15);
        }

        .pwa-app-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .pwa-banner-text {
            flex: 1;
            min-width: 0;
        }

        .pwa-banner-title {
            font-size: 15px;
            font-weight: 800;
            color: #f1f5f9;
            line-height: 1.2;
            margin: 0 0 3px;
            letter-spacing: -0.3px;
        }

        .pwa-banner-title span {
            color: #e2e8f0;
            font-weight: 300;
        }

        .pwa-banner-subtitle {
            font-size: 11px;
            color: #94a3b8;
            margin: 0;
            line-height: 1.4;
        }

        .pwa-banner-subtitle strong {
            color: #cbd5e1;
        }

        .pwa-ios-share-icon {
            display: inline-block;
            transform: rotate(0deg);
            font-style: normal;
        }

        .pwa-banner-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .pwa-install-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 9px 14px;
            background: #0ea5e9;
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.2s ease, transform 0.15s ease;
            box-shadow: 0 4px 14px rgba(14,165,233,0.4);
        }

        .pwa-install-btn:hover {
            background: #0284c7;
        }

        .pwa-install-btn:active {
            transform: scale(0.95);
        }

        .pwa-dismiss-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.1);
            color: #64748b;
            cursor: pointer;
            flex-shrink: 0;
            transition: background 0.2s, color 0.2s;
        }

        .pwa-dismiss-btn:hover {
            background: rgba(255,255,255,0.12);
            color: #94a3b8;
        }

        /* Setinha do iOS apontando para a barra inferior do Safari */
        .pwa-ios-arrow {
            text-align: center;
            margin-top: 8px;
            font-size: 12px;
            color: #475569;
            animation: pwa-bounce 1.5s ease-in-out infinite;
        }

        @keyframes pwa-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(4px); }
        }

        /* Brilho animado na borda do banner */
        #pwa-install-banner::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 21px;
            background: linear-gradient(135deg, rgba(14,165,233,0.3), transparent 50%, rgba(14,165,233,0.1));
            z-index: -1;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

// ─────────────────────────────────────────────
// Mostrar / Esconder Banner
// ─────────────────────────────────────────────
function showBanner(banner) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            banner.classList.add('is-visible');
        });
    });
}

function hideBanner(banner, permanent = false) {
    banner.classList.add('is-hiding');
    banner.classList.remove('is-visible');

    if (permanent) {
        localStorage.setItem(PWA_DISMISSED_KEY, 'true');
    }

    setTimeout(() => banner.remove(), 500);
}

// ─────────────────────────────────────────────
// Inicialização principal
// ─────────────────────────────────────────────
export function initPWAInstallBanner() {
    // Não mostra se já instalado ou dispensado permanentemente
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(PWA_DISMISSED_KEY) === 'true') return;
    if (localStorage.getItem(PWA_INSTALLED_KEY) === 'true') return;

    const ios = isIOS();
    injectStyles();

    // Captura o prompt nativo do Android antes de mostrar o banner
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    // Detecta se o app foi instalado e registra
    window.addEventListener('appinstalled', () => {
        localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        const banner = document.getElementById('pwa-install-banner');
        if (banner) hideBanner(banner, false);
    });

    // iOS: só mostra se o Safari for o navegador (sem suporte ao beforeinstallprompt)
    // Android: espera o beforeinstallprompt OU mostra assim mesmo após o delay
    setTimeout(() => {
        // Não injeta dois banners
        if (document.getElementById('pwa-install-banner')) return;

        document.body.insertAdjacentHTML('beforeend', createBannerHTML(ios));
        const banner = document.getElementById('pwa-install-banner');

        showBanner(banner);

        // Botão de instalar (Android)
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        localStorage.setItem(PWA_INSTALLED_KEY, 'true');
                    }
                    deferredPrompt = null;
                    hideBanner(banner, false);
                } else {
                    // beforeinstallprompt não disponível ainda: orientação genérica
                    alert('Para instalar: abra o menu do navegador (⋮) e toque em "Adicionar à tela inicial".');
                }
            });
        }

        // Botão de dispensar
        const dismissBtn = document.getElementById('pwa-dismiss-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => hideBanner(banner, true));
        }

    }, SHOW_DELAY_MS);
}
