document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('main.container');
    if (mainContainer) {
        mainContainer.style.opacity = '1';
    }
    const themeButtons = document.querySelectorAll('.theme-button');
    if (themeButtons.length > 0) {
        anime({
            targets: themeButtons,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100, {start: 300}),
            easing: 'easeOutExpo'
        });
    }
    const allButtons = document.querySelectorAll('button, a[role="button"]');
    allButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('clicked');
            button.addEventListener('animationend', () => {
                button.classList.remove('clicked');
            }, { once: true });
        });
    });
});