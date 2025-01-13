
document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const sortKey = this.getAttribute('data-sort');
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                // Toggle sort direction
                const isAsc = !this.classList.contains('sort-asc');
                
                // Remove sort classes from all headers
                headers.forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                
                // Add appropriate sort class
                this.classList.add(isAsc ? 'sort-asc' : 'sort-desc');
                
                // Sort rows
                rows.sort((a, b) => {
                    let aVal = a.querySelector(`td:nth-child(${Array.from(headers).indexOf(header) + 1})`).textContent;
                    let bVal = b.querySelector(`td:nth-child(${Array.from(headers).indexOf(header) + 1})`).textContent;
                    
                    if (sortKey === 'grade' || sortKey === 'tries' || sortKey === 'points') {
                        aVal = parseFloat(aVal) || 0;
                        bVal = parseFloat(bVal) || 0;
                    }
                    
                    if (aVal < bVal) return isAsc ? -1 : 1;
                    if (aVal > bVal) return isAsc ? 1 : -1;
                    return 0;
                });
                
                // Reinsert rows in new order
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    });
});
