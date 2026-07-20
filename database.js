import { getDatabase, ref, push, set, remove, onValue, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { app } from "./firebaseConfig.js";

const database = getDatabase(app);
console.log("🔥 Firebase Database inicializado");

// ===== TURMAS =====
export async function createTurma(nome, senha) {
    try {
        const turmasRef = ref(database, 'turmas');
        const newTurmaRef = push(turmasRef);
        await set(newTurmaRef, {
            nome: nome,
            senha: senha,
            createdAt: new Date().toISOString()
        });
        console.log("✅ Turma criada:", nome);
        return { success: true, id: newTurmaRef.key };
    } catch (error) {
        console.error("❌ Erro ao criar turma:", error);
        return { success: false, error: error.message };
    }
}

export function listarTurmas(callback) {
    const turmasRef = ref(database, 'turmas');
    onValue(turmasRef, (snapshot) => {
        const data = snapshot.val();
        const turmas = [];
        if (data) {
            for(let key in data) {
                turmas.push({
                    id: key,
                    nome: data[key].nome,
                    senha: data[key].senha,
                    createdAt: data[key].createdAt
                });
            }
        }
        
        // ===== ORDENAR TURMAS ALFABETICAMENTE =====
        turmas.sort((a, b) => {
            return a.nome.localeCompare(b.nome, 'pt-BR');
        });
        
        console.log("📚 Turmas carregadas:", turmas.length);
        callback(turmas);
    }, (error) => {
        console.error("❌ Erro ao listar turmas:", error);
        callback([]);
    });
}

export async function deleteTurma(id) {
    try {
        const turmaRef = ref(database, `turmas/${id}`);
        await remove(turmaRef);
        console.log("🗑️ Turma deletada:", id);
        return { success: true };
    } catch (error) {
        console.error("❌ Erro ao deletar turma:", error);
        return { success: false, error: error.message };
    }
}

export async function verificarSenhaTurma(turmaId, senha) {
    try {
        const turmaRef = ref(database, `turmas/${turmaId}`);
        const snapshot = await get(turmaRef);
        const turma = snapshot.val();
        const valido = turma && turma.senha === senha;
        console.log("🔑 Verificando senha:", valido ? "OK" : "FALHOU");
        return valido;
    } catch (error) {
        console.error("❌ Erro ao verificar senha:", error);
        return false;
    }
}

// ===== ANIVERSÁRIOS =====
export async function createBirthday(turmaId, nome, dataNascimento) {
    try {
        const birthdaysRef = ref(database, `turmas/${turmaId}/aniversarios`);
        const newBirthdayRef = push(birthdaysRef);
        await set(newBirthdayRef, {
            nome: nome,
            dataNascimento: dataNascimento,
            createdAt: new Date().toISOString()
        });
        console.log("✅ Aniversário criado:", nome);
        return { success: true };
    } catch (error) {
        console.error("❌ Erro ao criar aniversário:", error);
        return { success: false, error: error.message };
    }
}

export function readBirthdays(turmaId, callback) {
    const birthdaysRef = ref(database, `turmas/${turmaId}/aniversarios`);
    onValue(birthdaysRef, (snapshot) => {
        const data = snapshot.val();
        const birthdays = [];
        if (data) {
            for(let key in data) {
                birthdays.push({
                    id: key,
                    nome: data[key].nome,
                    dataNascimento: data[key].dataNascimento,
                    createdAt: data[key].createdAt
                });
            }
        }
        
        // ===== ORDENAR ANIVERSÁRIOS POR NOME =====
        birthdays.sort((a, b) => {
            return a.nome.localeCompare(b.nome, 'pt-BR');
        });
        
        console.log("🎂 Aniversários carregados:", birthdays.length);
        callback(birthdays);
    }, (error) => {
        console.error("❌ Erro ao ler aniversários:", error);
        callback([]);
    });
}

export async function deleteBirthday(turmaId, id) {
    try {
        const birthdayRef = ref(database, `turmas/${turmaId}/aniversarios/${id}`);
        await remove(birthdayRef);
        console.log("🗑️ Aniversário deletado:", id);
        return { success: true };
    } catch (error) {
        console.error("❌ Erro ao deletar aniversário:", error);
        return { success: false, error: error.message };
    }
}