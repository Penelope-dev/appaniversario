import { createBirthday, readBirthdays, deleteBirthday } from './crud.js';

let birthdays = [];

// Função para calcular idade
function calculateAge(birthDate) {
    const today = new Date();
    const [ano, mes, dia] = birthDate.split('-');
    let age = today.getFullYear() - parseInt(ano);
    const birthDayThisYear = new Date(today.getFullYear(), parseInt(mes) - 1, parseInt(dia));
    
    if (birthDayThisYear > today) {
        age--;
    }
    return age;
}

// Função para atualizar card de destaque do aniversariante do dia
function updateHighlightCard() {
    const today = new Date();
    const todayStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const birthdaysToday = birthdays.filter(birthday => {
        const [ano, mes, dia] = birthday.dataNascimento.split('-');
        const birthDateStr = `${dia}.${mes}`;
        return birthDateStr === todayStr;
    });
    
    const highlightCard = document.getElementById('highlightCard');
    const birthdayPersonDiv = document.getElementById('birthdayPerson');
    
    if (birthdaysToday.length > 0) {
        // Tem aniversariante(s) hoje
        if (birthdaysToday.length === 1) {
            const birthday = birthdaysToday[0];
            const age = calculateAge(birthday.dataNascimento);
            birthdayPersonDiv.innerHTML = `
                <div class="birthday-name">🎈 ${escapeHtml(birthday.nome)} 🎈</div>
                <div class="birthday-age">Completando ${age} anos!</div>
                <p>🎂 Parabéns! 🎂</p>
            `;
        } else {
            // Múltiplos aniversariantes
            let html = '<div class="birthday-list">';
            birthdaysToday.forEach(birthday => {
                const age = calculateAge(birthday.dataNascimento);
                html += `<li>🎉 ${escapeHtml(birthday.nome)} - ${age} anos 🎉</li>`;
            });
            html += '</div>';
            birthdayPersonDiv.innerHTML = html;
        }
        highlightCard.style.animation = 'pulse 2s infinite';
    } else {
        // Nenhum aniversariante hoje
        birthdayPersonDiv.innerHTML = `
            <p class="no-birthday">🎂 Nenhum aniversário hoje 🎂</p>
            <p style="font-size: 14px; margin-top: 10px;">Em breve teremos celebrações!</p>
        `;
        highlightCard.style.animation = 'none';
    }
}

// Função para verificar aniversários do dia
function checkBirthdaysToday() {
    const today = new Date();
    const todayStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const birthdaysToday = birthdays.filter(birthday => {
        const [ano, mes, dia] = birthday.dataNascimento.split('-');
        const birthDateStr = `${dia}.${mes}`;
        return birthDateStr === todayStr;
    });
    
    // Atualizar contador
    const todayCountElem = document.getElementById('todayCount');
    if (todayCountElem) {
        todayCountElem.textContent = birthdaysToday.length;
    }
    
    // Atualizar card de destaque
    updateHighlightCard();
    
    // Mostrar notificações
    birthdaysToday.forEach(birthday => {
        showNotification(`🎉 Hoje é aniversário de ${birthday.nome}! 🎂🎈`);
    });
    
    return birthdaysToday;
}

// Função para mostrar notificação
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    } else {
        alert(message);
    }
}

// Função para calcular dias até o próximo aniversário
function daysUntilBirthday(birthDate) {
    const today = new Date();
    const [ano, mes, dia] = birthDate.split('-');
    let nextBirthday = new Date(today.getFullYear(), parseInt(mes) - 1, parseInt(dia));
    
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Função para calcular dias que passaram desde o aniversário
function daysSinceBirthday(birthDate) {
    const today = new Date();
    const [ano, mes, dia] = birthDate.split('-');
    let lastBirthday = new Date(today.getFullYear(), parseInt(mes) - 1, parseInt(dia));
    
    if (lastBirthday > today) {
        lastBirthday.setFullYear(today.getFullYear() - 1);
    }
    
    const diffTime = today - lastBirthday;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Função para classificar aniversários
function categorizeBirthdays() {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const future = [];
    const past = [];
    
    birthdays.forEach(birthday => {
        const [ano, mes, dia] = birthday.dataNascimento.split('-');
        const birthDateThisYear = new Date(today.getFullYear(), parseInt(mes) - 1, parseInt(dia));
        
        // Comparar datas sem considerar horas
        if (birthDateThisYear >= todayDate) {
            // Aniversário futuro ou hoje
            future.push({
                ...birthday,
                daysLeft: daysUntilBirthday(birthday.dataNascimento)
            });
        } else {
            // Aniversário passado
            past.push({
                ...birthday,
                daysPassed: daysSinceBirthday(birthday.dataNascimento)
            });
        }
    });
    
    // Ordenar futuros por data (mais próximo primeiro)
    future.sort((a, b) => a.daysLeft - b.daysLeft);
    
    // Ordenar passados por data (mais recente primeiro)
    past.sort((a, b) => a.daysPassed - b.daysPassed);
    
    return { future, past };
}

// Função para formatar data
function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}`;
}

// Função para deletar item
async function deleteItem(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o aniversário de ${nome}?`)) {
        try {
            await deleteBirthday(id);
            showNotification(`✅ Aniversário de ${nome} removido com sucesso!`);
        } catch (error) {
            console.error('Erro ao deletar:', error);
            showNotification('❌ Erro ao remover aniversário');
        }
    }
}

// Função para renderizar tabelas
function renderTables() {
    const { future, past } = categorizeBirthdays();
    
    // Renderizar tabela de futuros
    const futureBody = document.getElementById('futureBody');
    if (futureBody) {
        futureBody.innerHTML = '';
        
        if (future.length === 0) {
            const row = futureBody.insertRow();
            row.innerHTML = `<td colspan="4" style="text-align: center;">Nenhum aniversário futuro cadastrado</td>`;
        } else {
            future.forEach(birthday => {
                const row = futureBody.insertRow();
                const dataFormatada = formatarData(birthday.dataNascimento);
                const diasTexto = birthday.daysLeft === 0 ? 'Hoje! 🎉' : `${birthday.daysLeft} dias`;
                
                row.innerHTML = `
                    <td>${escapeHtml(birthday.nome)}</td>
                    <td>${dataFormatada}</td>
                    <td>${diasTexto}</td>
                    <td><button class="btn-delete" data-id="${birthday.id}" data-nome="${escapeHtml(birthday.nome)}">Excluir</button></td>
                `;
            });
        }
    }
    
    // Renderizar tabela de passados
    const pastBody = document.getElementById('pastBody');
    if (pastBody) {
        pastBody.innerHTML = '';
        
        if (past.length === 0) {
            const row = pastBody.insertRow();
            row.innerHTML = `<td colspan="4" style="text-align: center;">Nenhum aniversário passado</td>`;
        } else {
            past.forEach(birthday => {
                const row = pastBody.insertRow();
                const dataFormatada = formatarData(birthday.dataNascimento);
                
                row.innerHTML = `
                    <td>${escapeHtml(birthday.nome)}</td>
                    <td>${dataFormatada}</td>
                    <td>${birthday.daysPassed} dias</td>
                    <td><button class="btn-delete" data-id="${birthday.id}" data-nome="${escapeHtml(birthday.nome)}">Excluir</button></td>
                `;
            });
        }
    }
    
    // Adicionar event listeners aos botões de deletar
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            const nome = button.getAttribute('data-nome');
            deleteItem(id, nome);
        });
    });
    
    // Atualizar total
    const totalCountElem = document.getElementById('totalCount');
    if (totalCountElem) {
        totalCountElem.textContent = birthdays.length;
    }
}

// Função para escapar HTML (proteção XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para carregar dados
function loadData() {
    readBirthdays((data) => {
        birthdays = data;
        renderTables();
        checkBirthdaysToday();
    });
}

// Configurar formulário
function setupForm() {
    const form = document.getElementById('birthdayForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nomeInput = document.getElementById('nome');
        const dataInput = document.getElementById('dataNascimento');
        
        const nome = nomeInput ? nomeInput.value.trim() : '';
        const dataNascimento = dataInput ? dataInput.value : '';
        
        if (!nome || !dataNascimento) {
            showNotification('❌ Por favor, preencha todos os campos!');
            return;
        }
        
        // Validar data
        const dataParts = dataNascimento.split('-');
        if (dataParts.length !== 3) {
            showNotification('❌ Data inválida!');
            return;
        }
        
        try {
            await createBirthday(nome, dataNascimento);
            if (nomeInput) nomeInput.value = '';
            if (dataInput) dataInput.value = '';
            showNotification(`✅ Aniversário de ${nome} cadastrado com sucesso!`);
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            showNotification('❌ Erro ao cadastrar aniversário. Verifique sua conexão.');
        }
    });
}

// Verificar aniversários periodicamente (a cada hora)
setInterval(() => {
    if (birthdays.length > 0) {
        checkBirthdaysToday();
    }
}, 3600000);

// Verificar também ao carregar a página e a cada minuto a data (para caso o usuário deixe a página aberta)
setInterval(() => {
    if (birthdays.length > 0) {
        renderTables();
        updateHighlightCard();
    }
}, 60000);

// Inicializar
function init() {
    console.log('Sistema de Aniversários iniciado!');
    setupForm();
    loadData();
}

// Iniciar aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
