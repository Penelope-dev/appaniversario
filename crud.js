import { getDatabase, ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { app } from "./firebaseConfig.js";

// Inicializar Database
const database = getDatabase(app);
const birthdaysRef = ref(database, 'aniversarios');

// Criar aniversário
export async function createBirthday(nome, dataNascimento) {
    try {
        const newBirthdayRef = push(birthdaysRef);
        await set(newBirthdayRef, {
            nome: nome,
            dataNascimento: dataNascimento,
            createdAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Erro ao criar:', error);
        throw error;
    }
}

// Ler todos os aniversários
export function readBirthdays(callback) {
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
        
        callback(birthdays);
    }, (error) => {
        console.error('Erro ao ler dados:', error);
        callback([]);
    });
}

// Deletar aniversário
export async function deleteBirthday(id) {
    try {
        const birthdayRef = ref(database, `aniversarios/${id}`);
        await remove(birthdayRef);
        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar:', error);
        throw error;
    }
}
