// ============ CONFIGURAÇÃO DE APIS ============
let API_CONFIG = {
  gemini_key: localStorage.getItem('gemini_key') || '',
  tmdb_key: localStorage.getItem('tmdb_key') || '',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initializeLucideIcons();
  carregarCapasDemo();
  verificarStatusAPIs();
});

function initializeLucideIcons() {
  setTimeout(() => {
    lucide.createIcons();
  }, 100);
}

// ============ MODAL DE CONFIGURAÇÃO DE APIS ============
function abrirModalConfig() {
  const modal = document.createElement('div');
  modal.id = 'config-modal';
  modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-netflix-card border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <i data-lucide="key" class="w-6 h-6 text-netflix-red"></i>
        Configurar Chaves de API
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            🔑 Google Gemini API Key
            <a href="https://makersuite.google.com/app/apikey" target="_blank" class="text-netflix-red hover:underline text-xs">
              (Obter chave)
            </a>
          </label>
          <input type="password" id="gemini-input" value="${API_CONFIG.gemini_key}" 
                 class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-netflix-red focus:outline-none">
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            🎬 TMDB API Key
            <a href="https://www.themoviedb.org/settings/api" target="_blank" class="text-netflix-red hover:underline text-xs">
              (Obter chave)
            </a>
          </label>
          <input type="password" id="tmdb-input" value="${API_CONFIG.tmdb_key}" 
                 class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-netflix-red focus:outline-none">
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button onclick="fecharModalConfig()" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition">
          Cancelar
        </button>
        <button onclick="salvarConfigAPIs()" class="flex-1 bg-netflix-red hover:bg-netflix-darkRed text-white px-4 py-2.5 rounded-lg font-bold transition">
          Salvar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  lucide.createIcons();
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModalConfig();
  });
}

function fecharModalConfig() {
  const modal = document.getElementById('config-modal');
  if (modal) modal.remove();
}

function salvarConfigAPIs() {
  const geminiKey = document.getElementById('gemini-input').value.trim();
  const tmdbKey = document.getElementById('tmdb-input').value.trim();

  if (!geminiKey && !tmdbKey) {
    alert('⚠️ Insira pelo menos uma chave de API!');
    return;
  }

  API_CONFIG.gemini_key = geminiKey;
  API_CONFIG.tmdb_key = tmdbKey;

  localStorage.setItem('gemini_key', geminiKey);
  localStorage.setItem('tmdb_key', tmdbKey);

  fecharModalConfig();
  verificarStatusAPIs();
  alert('✅ Chaves salvas com sucesso!');
}

function verificarStatusAPIs() {
  const banner = document.getElementById('api-status-banner');
  const statusText = document.getElementById('api-status-text');
  const botStatusText = document.getElementById('bot-status-text');
  
  if (API_CONFIG.gemini_key) {
    banner.style.display = 'none';
    if (botStatusText) botStatusText.textContent = '🟢 Online - Conectado ao Gemini';
    if (document.getElementById('bot-status-dot')) {
      document.getElementById('bot-status-dot').style.backgroundColor = '#22c55e';
    }
  } else {
    if (statusText) statusText.textContent = '⚠️ Modo Demonstração. Configure sua chave Gemini para ativar IA real.';
    if (botStatusText) botStatusText.textContent = '🟡 Demo Mode - Configure sua chave Gemini';
  }
}

// ============ CHATBOT GEMINI ============
async function enviarMensagem(event) {
  event.preventDefault();
  
  const input = document.getElementById('chat-input');
  const mensagem = input.value.trim();
  
  if (!mensagem) return;

  if (!API_CONFIG.gemini_key) {
    adicionarMensagemChat('AI', '⚠️ Configure sua chave do Google Gemini para usar o chatbot!');
    return;
  }

  // Adiciona mensagem do usuário
  adicionarMensagemChat('USER', mensagem);
  input.value = '';
  
  // Mostra indicador de digitação
  mostrarDigitando();

  try {
    const resposta = await chamarGemini(mensagem);
    removerDigitando();
    adicionarMensagemChat('AI', resposta);
  } catch (erro) {
    removerDigitando();
    adicionarMensagemChat('AI', `❌ Erro: ${erro.message}`);
  }
}

async function chamarGemini(mensagem) {
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Você é o CineBot, um assistente especializado em recomendações de filmes e séries. Responda de forma amigável e curta (max 150 caracteres). Foco em filmes/séries.\n\nUsuário: ${mensagem}`
          }
        ]
      }
    ]
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${API_CONFIG.gemini_key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.error?.message || 'Erro na API Gemini');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

function adicionarMensagemChat(tipo, texto) {
  const chatMessages = document.getElementById('chat-messages');
  
  const mensagemDiv = document.createElement('div');
  mensagemDiv.className = `flex items-start gap-3 ${tipo === 'USER' ? 'justify-end' : 'justify-start'} max-w-[85%] ${tipo === 'USER' ? 'ml-auto' : ''}`;
  
  if (tipo === 'USER') {
    mensagemDiv.innerHTML = `
      <div class="bg-netflix-red text-white p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed">
        <p>${escapeHTML(texto)}</p>
      </div>
      <div class="w-8 h-8 rounded-full bg-netflix-red shrink-0 flex items-center justify-center text-xs font-bold">
        VÊ
      </div>
    `;
  } else {
    mensagemDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-netflix-red shrink-0 flex items-center justify-center text-xs font-bold">
        AI
      </div>
      <div class="bg-gray-800/90 text-gray-100 p-4 rounded-2xl rounded-tl-none border border-gray-700/60 text-sm leading-relaxed">
        <p>${escapeHTML(texto)}</p>
      </div>
    `;
  }
  
  chatMessages.appendChild(mensagemDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function mostrarDigitando() {
  const chatMessages = document.getElementById('chat-messages');
  const digitando = document.createElement('div');
  digitando.id = 'digitando-indicator';
  digitando.className = 'flex items-start gap-3 max-w-[85%]';
  digitando.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-netflix-red shrink-0 flex items-center justify-center text-xs font-bold">
      AI
    </div>
    <div class="bg-gray-800/90 text-gray-100 p-4 rounded-2xl rounded-tl-none border border-gray-700/60">
      <div class="flex gap-1.5">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  `;
  chatMessages.appendChild(digitando);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removerDigitando() {
  const digitando = document.getElementById('digitando-indicator');
  if (digitando) digitando.remove();
}

function enviarPromptPronto(prompt) {
  document.getElementById('chat-input').value = prompt;
  enviarMensagem({ preventDefault: () => {} });
}

function limparChat() {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = `
    <div class="flex items-start gap-3 max-w-[85%]">
      <div class="w-8 h-8 rounded-full bg-netflix-red shrink-0 flex items-center justify-center text-xs font-bold">
        AI
      </div>
      <div class="bg-gray-800/90 text-gray-100 p-4 rounded-2xl rounded-tl-none border border-gray-700/60 text-sm leading-relaxed space-y-2">
        <p>Olá! Eu sou o CineBot. 🎬</p>
        <p class="text-gray-300">Me conte: <strong>qual o último filme ou série que você adorou assistir</strong>, ou que vibe você está procurando hoje à noite?</p>
      </div>
    </div>
  `;
}

// ============ CATÁLOGO TMDB ============
async function carregarCatalogoTMDB(tipo = 'popular') {
  if (!API_CONFIG.tmdb_key) {
    document.getElementById('catalog-grid').innerHTML = '<p class="text-gray-400">Configure sua chave TMDB para carregar o catálogo.</p>';
    return;
  }

  try {
    const url = `${TMDB_API_URL}/movie/${tipo}?api_key=${API_CONFIG.tmdb_key}&language=pt-BR`;
    const response = await fetch(url);
    const data = await response.json();

    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';

    data.results.slice(0, 20).forEach(filme => {
      const card = document.createElement('div');
      card.className = 'cursor-pointer group relative overflow-hidden rounded-lg transition-transform hover:scale-110';
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" 
             alt="${filme.title}" 
             class="w-full h-full object-cover rounded-lg"
             onclick="abrirDetalhesFilme(${filme.id})">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all rounded-lg flex items-end p-3">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <p class="text-white font-bold text-sm">${filme.title}</p>
            <p class="text-yellow-400 text-xs">⭐ ${filme.vote_average}</p>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (erro) {
    console.error('Erro ao carregar TMDB:', erro);
    document.getElementById('catalog-grid').innerHTML = `<p class="text-red-400">❌ Erro: ${erro.message}</p>`;
  }
}

async function abrirDetalhesFilme(filmId) {
  if (!API_CONFIG.tmdb_key) return;

  try {
    const url = `${TMDB_API_URL}/movie/${filmId}?api_key=${API_CONFIG.tmdb_key}&language=pt-BR`;
    const response = await fetch(url);
    const filme = await response.json();

    const modal = document.getElementById('movie-modal');
    document.getElementById('modal-img').src = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
    document.getElementById('modal-title').textContent = filme.title;
    document.getElementById('modal-year').textContent = new Date(filme.release_date).getFullYear();
    
    // Completa o modal conforme necessário
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } catch (erro) {
    console.error('Erro ao carregar detalhes:', erro);
  }
}

function fecharModal() {
  const modal = document.getElementById('movie-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function sincronizarTMDB() {
  alert('Sincronizando com TMDB...');
  carregarCatalogoTMDB('popular');
}

// ============ ANALISADOR VISUAL ============
function carregarCapasDemo() {
  const capas = [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1489599849228-ed4dc59b2e84?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1495909122917-a0ea47b0d36d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1512070679279-338ba6a40b6b?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1470114716159-e389f8712fda?auto=format&fit=crop&w=300&q=80',
  ];

  const grid = document.getElementById('poster-grid');
  grid.innerHTML = '';

  capas.forEach((capa, index) => {
    const card = document.createElement('div');
    card.className = 'poster-item relative cursor-pointer group overflow-hidden rounded-lg';
    card.innerHTML = `
      <img src="${capa}" alt="Capa ${index}" class="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-110">
      <div class="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
        <input type="checkbox" class="poster-checkbox w-6 h-6 rounded cursor-pointer hidden group-hover:block" data-id="${index}">
      </div>
    `;

    card.addEventListener('click', () => {
      const checkbox = card.querySelector('.poster-checkbox');
      checkbox.checked = !checkbox.checked;
      atualizarContagemSelecionados();
    });

    grid.appendChild(card);
  });
}

function atualizarContagemSelecionados() {
  const checkboxes = document.querySelectorAll('.poster-checkbox:checked');
  const contador = document.getElementById('selected-counter');
  const btnAnalyze = document.getElementById('btn-analyze');

  contador.textContent = `${checkboxes.length} selecionados`;
  btnAnalyze.disabled = checkboxes.length < 2;
}

function executarAnaliseVisual() {
  const checkboxes = document.querySelectorAll('.poster-checkbox:checked');
  
  if (checkboxes.length < 2) {
    alert('Selecione pelo menos 2 capas!');
    return;
  }

  const resultado = document.getElementById('analysis-result');
  resultado.classList.remove('hidden');

  // Resultado demo
  document.getElementById('ai-verdict-text').textContent = 
    'Com base em suas seleções, você tem preferência por filmes de ficção científica e drama psicológico. Recomendamos explorar narrativas complexas com reviravoltas emocionais.';

  document.getElementById('verdict-chips').innerHTML = `
    <span class="bg-netflix-red/20 text-netflix-red px-3 py-1 rounded-full text-xs">Ficção Científica</span>
    <span class="bg-netflix-red/20 text-netflix-red px-3 py-1 rounded-full text-xs">Drama</span>
    <span class="bg-netflix-red/20 text-netflix-red px-3 py-1 rounded-full text-xs">Suspense</span>
  `;

  document.getElementById('genres-bars').innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-xs w-20">Ficção Científica</span>
      <div class="flex-1 bg-gray-800 rounded-full h-2">
        <div class="bg-netflix-red h-2 rounded-full" style="width: 85%"></div>
      </div>
      <span class="text-xs text-gray-400">85%</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-xs w-20">Drama</span>
      <div class="flex-1 bg-gray-800 rounded-full h-2">
        <div class="bg-netflix-red h-2 rounded-full" style="width: 72%"></div>
      </div>
      <span class="text-xs text-gray-400">72%</span>
    </div>
  `;
}

// ============ FUNÇÕES AUXILIARES ============
function scrollToElement(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Animar pontos de digitação
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
  }
  .animate-bounce { animation: bounce 1.4s infinite; }
  .delay-100 { animation-delay: 0.2s; }
  .delay-200 { animation-delay: 0.4s; }
`;
document.head.appendChild(style);
