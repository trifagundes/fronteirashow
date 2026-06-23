/**
 * UI Module
 * Responsável por manipular o DOM e injetar conteúdo (Single Responsibility Principle)
 */
import { createEventCard, createFeaturedEventCard, createEventDetailsView } from './components.js';

/**
 * Exibe um Toast (Notificação Premium Flutuante)
 * @param {string} message - A mensagem a exibir
 * @param {string} iconClass - Classe do ícone Phosphor (ex: 'ph-heart')
 */
window.showToast = (message, iconClass = 'ph-info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 px-4 py-3 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl transform translate-y-10 opacity-0 transition-all duration-300 pointer-events-auto';
    
    toast.innerHTML = `
        <div class="flex-shrink-0 bg-primary-500/20 text-primary-500 p-1.5 rounded-full">
            <i class="ph-fill ${iconClass} text-lg"></i>
        </div>
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">${message}</span>
    `;

    container.appendChild(toast);

    // Anima a entrada (sobre pro lugar com opacity 1)
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    // Remove automaticamente após 3 segundos
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
};

export const renderFeaturedEvents = (events, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!events || events.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = events.map(createFeaturedEventCard).join('');
};

export const renderEvents = (events, containerId, append = false) => {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container com ID '${containerId}' não encontrado.`);
        return;
    }

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 text-slate-500 dark:text-slate-400">
                <i class="ph ph-calendar-blank text-4xl mb-2"></i>
                <p>Nenhum evento encontrado.</p>
            </div>
        `;
        return;
    }

    const html = events.map(createEventCard).join('');
    
    if (append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }
};

export const openEventModal = (event) => {
    const modal = document.getElementById('event-details-modal');
    const overlay = document.getElementById('event-modal-overlay');
    if (!modal) return;

    // Injeta o conteúdo
    modal.innerHTML = createEventDetailsView(event);

    // Mostra o modal (desliza de baixo para cima)
    modal.classList.remove('translate-y-full');
    modal.classList.add('translate-y-0');

    // Exibe o overlay escurecido
    if (overlay) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100', 'pointer-events-auto');
        // Click no overlay fecha o modal
        overlay.onclick = closeEventModal;
    }

    // Previne rolagem no body principal
    document.body.style.overflow = 'hidden';

    // Adiciona listener para fechar no botão interno
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEventModal);
    }

    // Lógica de Swipe-to-Dismiss no Drag Handle
    const dragHandle = document.getElementById('modal-drag-handle');
    if (dragHandle) {
        let startY = 0;
        let currentY = 0;

        dragHandle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            modal.style.transition = 'none'; // Desativa transição para acompanhar o dedo
        }, { passive: true });

        dragHandle.addEventListener('touchmove', (e) => {
            if (startY === 0) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;

            // Só permite arrastar para baixo
            if (deltaY > 0) {
                e.preventDefault(); // Evita scroll da página por baixo
                modal.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: false });

        dragHandle.addEventListener('touchend', () => {
            if (startY === 0) return;
            const deltaY = currentY - startY;
            
            // Restaura a transição do CSS
            modal.style.transition = ''; 

            if (deltaY > 150) { // Se arrastou mais de 150px, fecha a aba
                // Reseta o inline style para a classe do CSS tomar conta
                modal.style.transform = ''; 
                closeEventModal();
            } else { // Senão, volta ao topo como um elástico
                modal.style.transform = '';
            }
            
            startY = 0;
            currentY = 0;
        });
    }
};

export const closeEventModal = () => {
    const modal = document.getElementById('event-details-modal');
    const overlay = document.getElementById('event-modal-overlay');
    if (!modal) return;

    // Esconde o modal (desliza de volta para baixo)
    modal.classList.remove('translate-y-0');
    modal.classList.add('translate-y-full');

    // Esconde o overlay
    if (overlay) {
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.onclick = null;
    }

    // Restaura rolagem no body principal
    document.body.style.overflow = '';
};
