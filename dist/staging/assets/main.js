document.addEventListener('DOMContentLoaded', () => {
  console.log('Solo App - Staging Environment loaded');
  const app = document.getElementById('app');
  const status = document.createElement('div');
  status.textContent = 'JavaScript loaded successfully!';
  status.style.backgroundColor = '#e6f7ff';
  status.style.padding = '10px';
  status.style.marginTop = '20px';
  status.style.borderRadius = '4px';
  app.appendChild(status);
});
