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
