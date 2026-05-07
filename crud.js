import { getDatabase, ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";
import { app } from "./firebaseConfig.js";

const database = getDatabase(app);
const birthdaysRef = ref(database, 'aniversarios');

// Criar aniversário
export function createBirthday(nome, dataNascimento) {
    const newBirthdayRef = push(birthdaysRef);
    return set(newBirthdayRef, {
        nome: nome,
        dataNascimento: dataNascimento,
        createdAt: new Date().toISOString()
    });
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
                    ...data[key]
                });
            }
        }
        
        callback(birthdays);
    });
}

// Deletar aniversário
export function deleteBirthday(id) {
    const birthdayRef = ref(database, `aniversarios/${id}`);
    return remove(birthdayRef);
}