import { loginAdmin, logoutAdmin, isAdminLoggedIn, getAdminEmail } from './auth.js';
import { listarTurmas, verificarSenhaTurma } from './database.js';

console.log("🚀 Sistema iniciado!");

// Elementos DOM
const adminBtn = document.getElementById('adminBtn');
const loginModal = document.getElementById('loginModal');
const adminModal = document.getElementById('adminModal');
const turmaModal = document.getElementById('turmaModal');
const turmaSelect = document.getElementById('turmaSelect');
const senhaTurmaInput = document.getElementById('senhaTurma');
const entrarTurmaBtn = document.getElementById('entrarTurmaBtn');
const logoutAdminBtn = document.getElementById('logoutAdminBtn');
const loginForm = document.getElementById('loginForm');
const adminEmailSpan = document.getElementById('adminEmail');

let todasTurmas = [];

// ===== FUNÇÕES PRINCIPAIS =====
function atualizarUIAdmin() {
    const logado = isAdminLoggedIn();
    if (logado) {
        adminBtn.textContent = '👨‍🏫 Gerenciar Turmas';
        logoutAdminBtn.style.display = 'block';
        if (adminEmailSpan) adminEmailSpan.textContent = getAdminEmail();
    } else {
        adminBtn.textContent = '👨‍🏫 Acessar Admin';
        logoutAdminBtn.style.display = 'none';
    }
}

adminBtn.onclick = () => {
    if (isAdminLoggedIn()) {
        adminModal.style.display = 'block';
        carregarTurmasAdmin();
    } else {
        loginModal.style.display = 'block';
    }
};

document.querySelectorAll('.close, .close-turma, .close-login').forEach(btn => {
    btn.onclick = () => {
        loginModal.style.display = 'none';
        adminModal.style.display = 'none';
        turmaModal.style.display = 'none';
    };
});

// Login
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;
    
    const result = await loginAdmin(email, senha);
    if (result.success) {
        loginModal.style.display = 'none';
        atualizarUIAdmin();
        adminModal.style.display = 'block';
        carregarTurmasAdmin();
        showNotification('✅ Login realizado com sucesso!');
    } else {
        alert('❌ Email ou senha incorretos! Por favor, verifique suas credenciais.');
    }
};

// Logout
logoutAdminBtn.onclick = async () => {
    await logoutAdmin();
    atualizarUIAdmin();
    adminModal.style.display = 'none';
    showNotification('✅ Logout realizado!');
};

// ===== CARREGAR TURMAS (ADMIN) - JÁ VEM ORDENADO DO DATABASE =====
function carregarTurmasAdmin() {
    listarTurmas((turmas) => {
        const listaDiv = document.getElementById('listaTurmas');
        if (listaDiv && isAdminLoggedIn()) {
            if (turmas.length === 0) {
                listaDiv.innerHTML = '<p class="sem-dados">Nenhuma turma cadastrada</p>';
            } else {
                listaDiv.innerHTML = '';
                turmas.forEach(t => {
                    listaDiv.innerHTML += `
                        <div class="turma-item" data-id="${t.id}">
                            <div>
                                <strong class="turma-nome">📚 ${t.nome}</strong><br>
                                <small>🆔 Criada em: ${new Date(t.createdAt).toLocaleDateString()}</small>
                            </div>
                            <div class="turma-acoes">
                                <button class="btn-delete" data-id="${t.id}" data-nome="${t.nome}">🗑️ Excluir</button>
                            </div>
                        </div>
                    `;
                });
                
                document.querySelectorAll('#listaTurmas .btn-delete').forEach(btn => {
                    btn.onclick = async () => {
                        if (confirm('⚠️ Excluir esta turma?')) {
                            const { deleteTurma } = await import('./database.js');
                            await deleteTurma(btn.dataset.id);
                            carregarTurmasAdmin();
                            showNotification('✅ Turma excluída!');
                        }
                    };
                });
                
                const filtroAdmin = document.getElementById('filtroAdmin');
                if (filtroAdmin) {
                    filtroAdmin.addEventListener('input', () => {
                        const termo = (filtroAdmin.value || '').toLowerCase();
                        document.querySelectorAll('#listaTurmas .turma-item').forEach(item => {
                            const nome = item.querySelector('.turma-nome')?.textContent?.toLowerCase() || '';
                            item.style.display = nome.includes(termo) ? 'flex' : 'none';
                        });
                    });
                }
            }
        }
    });
}

// ===== CARREGAR TURMAS (ALUNO) - JÁ VEM ORDENADO DO DATABASE =====
function carregarTurmasAluno() {
    listarTurmas((turmas) => {
        todasTurmas = turmas;
        turmaSelect.innerHTML = '<option value="">📚 Selecione uma turma</option>';
        turmas.forEach(t => {
            turmaSelect.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
        });
    });
}

// ===== ENTRAR NA TURMA =====
entrarTurmaBtn.onclick = async () => {
    const turmaId = turmaSelect.value;
    const senha = senhaTurmaInput.value;
    
    if (!turmaId || !senha) {
        showNotification('❌ Selecione uma turma e digite o código!');
        return;
    }
    
    const valido = await verificarSenhaTurma(turmaId, senha);
    if (valido) {
        const turmaNome = turmaSelect.options[turmaSelect.selectedIndex].text;
        document.getElementById('turmaNome').innerHTML = `🎓 ${turmaNome}`;
        turmaModal.style.display = 'block';
        senhaTurmaInput.value = '';
        showNotification(`✅ Bem-vindo à turma ${turmaNome}!`);
        
        const { carregarDadosTurma } = await import('./aluno.js');
        carregarDadosTurma(turmaId);
    } else {
        showNotification('❌ Código de acesso incorreto!');
    }
};

// ===== SAIR DA TURMA =====
document.getElementById('sairTurmaBtn').onclick = () => {
    turmaModal.style.display = 'none';
    showNotification('👋 Você saiu da turma');
};

// ===== TOGGLE SENHA =====
const toggleSenhaBtn = document.getElementById('toggleSenha');
const loginSenhaInput = document.getElementById('loginSenha');

if (toggleSenhaBtn && loginSenhaInput) {
    toggleSenhaBtn.addEventListener('click', () => {
        if (loginSenhaInput.type === 'password') {
            loginSenhaInput.type = 'text';
            toggleSenhaBtn.textContent = '🙈';
        } else {
            loginSenhaInput.type = 'password';
            toggleSenhaBtn.textContent = '👁️';
        }
    });
}

// ===== NOTIFICAÇÃO =====
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 3000);
    }
}

// ===== FECHAR MODAL =====
window.onclick = (event) => {
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === adminModal) adminModal.style.display = 'none';
    if (event.target === turmaModal) turmaModal.style.display = 'none';
};

// ===== FORMULÁRIO ADMIN =====
document.getElementById('createTurmaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nomeTurma').value;
    const senha = document.getElementById('senhaTurmaAdmin').value;
    
    if (!nome || !senha) {
        showNotification('❌ Preencha todos os campos');
        return;
    }
    
    const { createTurma } = await import('./database.js');
    const result = await createTurma(nome, senha);
    if (result.success) {
        showNotification(`✅ Turma "${nome}" criada!`);
        document.getElementById('createTurmaForm').reset();
        carregarTurmasAdmin();
        carregarTurmasAluno();
    } else {
        showNotification(`❌ Erro: ${result.error}`);
    }
});

// ===== INICIAR =====
atualizarUIAdmin();
carregarTurmasAluno();

console.log("✅ Sistema pronto!");