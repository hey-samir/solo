// Table scroll detection
document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('.table-responsive');
    
    const checkTableScroll = () => {
        tables.forEach(table => {
            if (table.scrollWidth > table.clientWidth) {
                table.classList.add('is-scrollable');
            } else {
                table.classList.remove('is-scrollable');
            }
        });
    };

    // Check on load and resize
    checkTableScroll();
    window.addEventListener('resize', checkTableScroll);

    // Add touch feedback for interactive elements
    const touchElements = document.querySelectorAll('.btn, .nav-link, [role="button"]');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
});
