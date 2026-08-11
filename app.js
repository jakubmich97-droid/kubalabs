document.querySelectorAll('[data-current-year]').forEach(element => {
  element.textContent = new Date().getFullYear();
});

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 12);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav?.classList.toggle('open', !isOpen);
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
  });
});

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px' });
  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('visible'));
}

const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card[data-category]');
const searchInput = document.getElementById('project-search');
const emptyState = document.getElementById('empty-state');
let activeFilter = 'all';

function normalizeText(value) {
  return value.toLocaleLowerCase('cs').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function filterProjects() {
  const query = normalizeText(searchInput?.value.trim() || '');
  let visibleCount = 0;
  projectCards.forEach(card => {
    const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const searchableText = normalizeText(`${card.dataset.search || ''} ${card.textContent}`);
    const matchesSearch = !query || searchableText.includes(query);
    const isVisible = matchesCategory && matchesSearch;
    card.classList.toggle('is-hidden', !isVisible);
    if (isVisible) visibleCount += 1;
  });
  if (emptyState) emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    filterProjects();
  });
});

searchInput?.addEventListener('input', filterProjects);

const protectedApps = document.querySelectorAll('[data-protected-app]');
const accessDialog = document.getElementById('access-dialog');
const accessForm = document.getElementById('access-form');
const passwordInput = document.getElementById('access-password');
const passwordError = document.getElementById('password-error');
const dialogTitle = document.getElementById('access-dialog-title');
const dialogClose = accessDialog?.querySelector('.dialog-close');

const protectedAppConfig = {
  tenis: {
    title: 'Tenisová bilance',
    password: 'tenis',
    accessKey: 'kubalabs-tennis-access'
  },
  movienight: {
    title: 'MovieNight',
    password: 'film',
    accessKey: 'kubalabs-movienight-access'
  }
};

function openProtectedApp(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

protectedApps.forEach(protectedApp => {
  protectedApp.addEventListener('click', event => {
    event.preventDefault();

    const appKey = protectedApp.dataset.protectedApp;
    const config = protectedAppConfig[appKey];
    if (!config) return;

    if (sessionStorage.getItem(config.accessKey) === 'granted') {
      openProtectedApp(protectedApp.href);
      return;
    }

    accessDialog?.showModal();
    accessDialog.dataset.targetUrl = protectedApp.href;
    accessDialog.dataset.appKey = appKey;
    if (dialogTitle) dialogTitle.textContent = config.title;
    passwordError.textContent = '';
    accessForm?.reset();
    setTimeout(() => passwordInput?.focus(), 50);
  });
});

accessForm?.addEventListener('submit', event => {
  event.preventDefault();

  const appKey = accessDialog.dataset.appKey;
  const config = protectedAppConfig[appKey];

  if (!config || passwordInput.value.trim().toLocaleLowerCase('cs') !== config.password) {
    passwordError.textContent = 'Nesprávné heslo. Zkus to znovu.';
    passwordInput.select();
    return;
  }

  sessionStorage.setItem(config.accessKey, 'granted');
  const targetUrl = accessDialog.dataset.targetUrl;
  accessDialog.close();
  openProtectedApp(targetUrl);
});

dialogClose?.addEventListener('click', () => accessDialog.close());

accessDialog?.addEventListener('click', event => {
  if (event.target === accessDialog) accessDialog.close();
});
