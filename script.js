const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

async function loadContent() {
  try {
    const response = await fetch('data/site.json');
    if (!response.ok) throw new Error('Content unavailable');
    const site = await response.json();
    $('#product-grid').innerHTML = site.products.map(product => `
      <article class="product-card">
        <div class="card-top"><span>${product.number}</span><span class="card-symbol">${product.symbol}</span></div>
        <h3>${product.title}</h3><p>${product.description}</p>
        <a href="#contact" aria-label="Learn about ${product.title}">Discover <span>→</span></a>
      </article>`).join('');
    const email = `mailto:${site.email}`;
    $('#email-link').href = email; $('#chat-email').href = email;
    $('#copyright').textContent = `© ${site.year} ${site.company}. All rights reserved.`;
  } catch {
    $('#copyright').textContent = `© ${new Date().getFullYear()} Mountain Spikes. All rights reserved.`;
  }
}

const menuButton = $('.menu-toggle');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  $('.mobile-menu').classList.toggle('is-open', !open);
});
$$('.mobile-menu a').forEach(link => link.addEventListener('click', () => menuButton.click()));

const topButton = $('.back-to-top');
window.addEventListener('scroll', () => topButton.classList.toggle('visible', window.scrollY > 560), { passive: true });
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const panel = $('.chat-panel');
const setChat = open => { panel.classList.toggle('open', open); panel.setAttribute('aria-hidden', String(!open)); };
$$('[data-open-chat]').forEach(button => button.addEventListener('click', () => setChat(true)));
$('.close-chat').addEventListener('click', () => setChat(false));
$$('.chat-options button').forEach(button => button.addEventListener('click', () => {
  $('.chat-response').textContent = button.textContent.includes('build') ? 'We create digital products, brand systems, and focused growth support.' : button.textContent.includes('approach') ? 'We combine clear thinking and thoughtful craft—then build only what moves the work forward.' : 'Great—send us a note and tell us a little about your next climb.';
}));

loadContent();
