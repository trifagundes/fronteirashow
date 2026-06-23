/**
 * Theme Module
 * Responsável por gerenciar o Dark/Light mode
 */

export const initThemeToggle = () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Verifica preferência salva ou do sistema
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        // Toggle na classe do HTML
        document.documentElement.classList.toggle('dark');
        
        // Salva a preferência
        if (document.documentElement.classList.contains('dark')) {
            localStorage.setItem('color-theme', 'dark');
        } else {
            localStorage.setItem('color-theme', 'light');
        }
    });
};
