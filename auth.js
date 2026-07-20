const ADMIN_EMAIL = "flexa.senai@docente.br";
const ADMIN_PASSWORD = "123456";

export async function loginAdmin(email, password) {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLogado', 'true');
        localStorage.setItem('adminEmail', email);
        return { success: true };
    }
    return { success: false };
}

export function isAdminLoggedIn() {
    return localStorage.getItem('adminLogado') === 'true';
}

export async function logoutAdmin() {
    localStorage.removeItem('adminLogado');
    localStorage.removeItem('adminEmail');
    return { success: true };
}

export function getAdminEmail() {
    return localStorage.getItem('adminEmail') || 'Admin';
}
