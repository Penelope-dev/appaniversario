import { readBirthdays, createBirthday, deleteBirthday } from './database.js';

let turmaAtual = null;
let birthdays = [];
let editandoId = null;

// Elementos DOM
const nomeInput = document.getElementById('nome');
const dataInput = document.getElementById('dataNascimento');
const birthdayForm = document.getElementById('birthdayForm');
const sairTurmaBtn = document.getElementById('sairTurmaBtn');
const filtroFuturos = document.getElementById('filtroFuturos');
const filtroPassados = document.getElementById('filtroPassados');

// ===== SAIR DA TURMA =====
if (sairTurmaBtn) {
    sairTurmaBtn.onclick = () => {
        document.getElementById('turmaModal').style.display = 'none';
        turmaAtual = null;
        birthdays = [];
        cancelarEdicao();
        showNotification('👋 Você saiu da turma');
    };
}

// ===== CARREGAR DADOS DA TURMA =====
export function carregarDadosTurma(turmaId) {
    turmaAtual = turmaId;
    readBirthdays(turmaId, (data) => {
        birthdays = data;
        renderizarTudo();
    });
}

// ===== FUNÇÕES DE EDIÇÃO =====
function editarAniversario(id, nome, dataNascimento) {
    editandoId = id;
    if (nomeInput) nomeInput.value = nome;
    if (dataInput) dataInput.value = dataNascimento;
    const btn = document.querySelector('#birthdayForm button');
    if (btn) btn.textContent = '✏️ Atualizar';
    showNotification('✏️ Editando: ' + nome);
}

function cancelarEdicao() {
    editandoId = null;
    if (nomeInput) nomeInput.value = '';
    if (dataInput) dataInput.value = '';
    const btn = document.querySelector('#birthdayForm button');
    if (btn) btn.textContent = '✅ Cadastrar';
}

// ===== CALCULAR DIAS =====
function calcularIdade(data) {
    const hoje = new Date();
    const [ano, mes, dia] = data.split('-');
    let idade = hoje.getFullYear() - parseInt(ano);
    const aniversario = new Date(hoje.getFullYear(), parseInt(mes)-1, parseInt(dia));
    if (aniversario > hoje) idade--;
    return idade;
}

function diasAte(data) {
    const hoje = new Date();
    const [ano, mes, dia] = data.split('-');
    let prox = new Date(hoje.getFullYear(), parseInt(mes)-1, parseInt(dia));
    if (prox < hoje) prox.setFullYear(hoje.getFullYear() + 1);
    return Math.ceil((prox - hoje) / (1000*60*60*24));
}

function diasDesde(data) {
    const hoje = new Date();
    const [ano, mes, dia] = data.split('-');
    let ultimo = new Date(hoje.getFullYear(), parseInt(mes)-1, parseInt(dia));
    if (ultimo > hoje) ultimo.setFullYear(hoje.getFullYear() - 1);
    return Math.floor((hoje - ultimo) / (1000*60*60*24));
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}`;
}

// ===== FILTROS =====
function filtrarAniversarios(tabela, filtroInput) {
    const termo = (filtroInput?.value || '').toLowerCase();
    const rows = tabela.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const nome = row.querySelector('td:first-child')?.textContent?.toLowerCase() || '';
        row.style.display = nome.includes(termo) ? '' : 'none';
    });
}

if (filtroFuturos) {
    filtroFuturos.addEventListener('input', () => {
        const table = document.getElementById('futureTable');
        filtrarAniversarios(table, filtroFuturos);
    });
}

if (filtroPassados) {
    filtroPassados.addEventListener('input', () => {
        const table = document.getElementById('pastTable');
        filtrarAniversarios(table, filtroPassados);
    });
}

// ===== RENDERIZAR =====
function renderizarTudo() {
    const hoje = new Date();
    const hojeStr = `${hoje.getDate().toString().padStart(2,'0')}.${(hoje.getMonth()+1).toString().padStart(2,'0')}`;
    
    const anivHoje = [], futuros = [], passados = [];
    
    birthdays.forEach(b => {
        const [ano, mes, dia] = b.dataNascimento.split('-');
        const dataStr = `${dia}.${mes}`;
        if (dataStr === hojeStr) {
            anivHoje.push(b);
        } else {
            const dias = diasAte(b.dataNascimento);
            if (dias > 0) {
                futuros.push({ ...b, dias });
            } else {
                passados.push({ ...b, dias: diasDesde(b.dataNascimento) });
            }
        }
    });
    
    // Ordenar futuros por dias restantes (mais próximo primeiro)
    futuros.sort((a,b) => a.dias - b.dias);
    
    // Ordenar passados por dias (mais recente primeiro)
    passados.sort((a,b) => a.dias - b.dias);
    
    // Atualizar stats
    document.getElementById('totalCount').textContent = birthdays.length;
    document.getElementById('todayCount').textContent = anivHoje.length;
    
    // Card destaque
    const cardDia = document.getElementById('birthdayPerson');
    if (anivHoje.length === 1) {
        const b = anivHoje[0];
        cardDia.innerHTML = `
            <div class="birthday-name">🎈 ${b.nome} 🎈</div>
            <div class="birthday-age">🎂 ${calcularIdade(b.dataNascimento)} anos 🎂</div>
            <p style="margin-top: 12px;">🎉 Parabéns! 🎉</p>
        `;
    } else if (anivHoje.length > 1) {
        let html = '<div class="birthday-list">';
        anivHoje.forEach(b => {
            html += `<li>🎉 ${b.nome} - ${calcularIdade(b.dataNascimento)} anos 🎉</li>`;
        });
        html += '</div>';
        cardDia.innerHTML = html;
    } else {
        cardDia.innerHTML = '<p class="sem-aniversario">🎂 Nenhum aniversário hoje 🎂</p>';
    }
    
    // Tabela futuros
    const futureBody = document.getElementById('futureBody');
    futureBody.innerHTML = '';
    if (futuros.length === 0) {
        futureBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">🎯 Nenhum aniversário futuro</td></tr>';
    } else {
        futuros.forEach(b => {
            const row = futureBody.insertRow();
            const diasText = b.dias === 0 ? 'Hoje! 🎉' : `${b.dias} dias`;
            row.innerHTML = `
                <td><strong>${b.nome}</strong></td>
                <td>${formatarData(b.dataNascimento)}</td>
                <td class="dias-futuros">${diasText}</td>
                <td class="acoes-cell">
                    <button class="btn-edit" data-id="${b.id}" data-nome="${b.nome}" data-data="${b.dataNascimento}">✏️</button>
                    <button class="btn-delete" data-id="${b.id}">🗑️</button>
                </td>
            `;
        });
    }
    
    // Tabela passados
    const pastBody = document.getElementById('pastBody');
    pastBody.innerHTML = '';
    if (passados.length === 0) {
        pastBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">📅 Nenhum aniversário passado</td></tr>';
    } else {
        passados.forEach(b => {
            const row = pastBody.insertRow();
            const diasText = b.dias === 1 ? '1 dia' : `${b.dias} dias`;
            row.innerHTML = `
                <td><strong>${b.nome}</strong></td>
                <td>${formatarData(b.dataNascimento)}</td>
                <td class="dias-passados">⏪ ${diasText}</td>
                <td class="acoes-cell">
                    <button class="btn-edit" data-id="${b.id}" data-nome="${b.nome}" data-data="${b.dataNascimento}">✏️</button>
                    <button class="btn-delete" data-id="${b.id}">🗑️</button>
                </td>
            `;
        });
    }
    
    // Eventos delete
    document.querySelectorAll('#futureBody .btn-delete, #pastBody .btn-delete').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('Excluir este aniversário?')) {
                await deleteBirthday(turmaAtual, btn.dataset.id);
                carregarDadosTurma(turmaAtual);
                showNotification('✅ Aniversário excluído!');
            }
        };
    });
    
    // Eventos edit
    document.querySelectorAll('#futureBody .btn-edit, #pastBody .btn-edit').forEach(btn => {
        btn.onclick = () => {
            editarAniversario(btn.dataset.id, btn.dataset.nome, btn.dataset.data);
            document.getElementById('birthdayForm').scrollIntoView({ behavior: 'smooth' });
        };
    });
    
    // Aplicar filtros
    if (filtroFuturos?.value) {
        const table = document.getElementById('futureTable');
        filtrarAniversarios(table, filtroFuturos);
    }
    if (filtroPassados?.value) {
        const table = document.getElementById('pastTable');
        filtrarAniversarios(table, filtroPassados);
    }
}

// ===== FORMULÁRIO DE CADASTRO/EDIÇÃO =====
if (birthdayForm) {
    birthdayForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = nomeInput?.value.trim();
        const data = dataInput?.value;
        
        if (!nome || !data) return showNotification('❌ Preencha todos os campos');
        if (!turmaAtual) return showNotification('❌ Nenhuma turma selecionada');
        
        if (editandoId) {
            if (confirm(`✏️ Atualizar "${nome}"?`)) {
                await deleteBirthday(turmaAtual, editandoId);
                const result = await createBirthday(turmaAtual, nome, data);
                if (result.success) {
                    showNotification(`✏️ ${nome} atualizado!`);
                    cancelarEdicao();
                    carregarDadosTurma(turmaAtual);
                }
            }
        } else {
            const result = await createBirthday(turmaAtual, nome, data);
            if (result.success) {
                if (nomeInput) nomeInput.value = '';
                if (dataInput) dataInput.value = '';
                showNotification(`✅ ${nome} cadastrado!`);
                carregarDadosTurma(turmaAtual);
            }
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
