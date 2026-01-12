/**
 * BANCO POLI - Laboratorio de CSRF
 * ================================
 * Este servidor es INTENCIONALMENTE VULNERABLE a ataques CSRF
 * Solo para fines educativos - NO usar en producción
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({
    cookie: true
});
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Base de datos simulada (en memoria)
const usuarios = {
    'estudiante': { password: '1234', saldo: 1000 }
};

// Historial de transferencias
let transferencias = [];

// ==========================================
// PÁGINA DE LOGIN
// ==========================================
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Banco Poli - Login</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0;
                }
                .login-box {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    width: 300px;
                }
                h1 {
                    color: #1e3c72;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    text-align: center;
                    font-size: 50px;
                    margin-bottom: 10px;
                }
                input {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                button {
                    width: 100%;
                    padding: 12px;
                    background: #1e3c72;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background: #2a5298;
                }
                .hint {
                    background: #f0f0f0;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="login-box">
                <div class="logo">🏦</div>
                <h1>Banco Poli</h1>
                <form action="/login" method="POST">
                    <input type="text" name="usuario" placeholder="Usuario" required>
                    <input type="password" name="password" placeholder="Contraseña" required>
                    <button type="submit">Iniciar Sesión</button>
                </form>
                <div class="hint">
                    <strong>Credenciales de prueba:</strong><br>
                    Usuario: estudiante<br>
                    Contraseña: 1234
                </div>
            </div>
        </body>
        </html>
    `);
});

// ==========================================
// PROCESAR LOGIN
// ==========================================
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    
    if (usuarios[usuario] && usuarios[usuario].password === password) {
        // ⚠️ Cookie de sesión simple (vulnerable)
        res.cookie('sesion', usuario, { 
            httpOnly: false,  // Vulnerable: debería ser true
            // sameSite: 'Strict' // NO incluido = vulnerable a CSRF
        });
        res.redirect('/');
    } else {
        res.send(`
            <h1>❌ Credenciales incorrectas</h1>
            <a href="/login">Volver al login</a>
        `);
    }
});

// ==========================================
// MIDDLEWARE: Verificar sesión
// ==========================================
function verificarSesion(req, res, next) {
    const usuario = req.cookies.sesion;
    if (usuario && usuarios[usuario]) {
        req.usuario = usuario;
        next();
    } else {
        res.redirect('/login');
    }
}

// ==========================================
// PÁGINA PRINCIPAL - Dashboard
// ==========================================
app.get('/', verificarSesion, csrfProtection, (req, res) => {
    const usuario = req.usuario;
    const saldo = usuarios[usuario].saldo;
    
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Banco Poli - Mi Cuenta</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                .header {
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    color: white;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header h1 {
                    margin: 0;
                }
                .logout {
                    color: white;
                    text-decoration: none;
                    background: rgba(255,255,255,0.2);
                    padding: 10px 20px;
                    border-radius: 5px;
                }
                .container {
                    max-width: 800px;
                    margin: 30px auto;
                    padding: 0 20px;
                }
                .card {
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .saldo {
                    font-size: 48px;
                    color: #1e3c72;
                    font-weight: bold;
                }
                .saldo-label {
                    color: #666;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                h2 {
                    color: #1e3c72;
                    border-bottom: 2px solid #1e3c72;
                    padding-bottom: 10px;
                }
                input, select {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                button {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background: #c0392b;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-size: 12px;
                }
                .warning-icon {
                    font-size: 20px;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏦 Banco Poli</h1>
                <div class="user-info">
                    <span>👤 ${usuario}</span>
                    <a href="/logout" class="logout">Cerrar Sesión</a>
                </div>
            </div>
            
            <div class="container">
                <div class="card">
                    <div class="saldo-label">Saldo Disponible</div>
                    <div class="saldo">$${saldo.toLocaleString()}</div>
                </div>
                
                <div class="card">
                    <h2>💸 Realizar Transferencia</h2>
                    <form action="/transferir" method="POST">
                        <!-- TOKEN CSRF -->
                        <input type="hidden" name="_csrf" value="${req.csrfToken()}">

                        <label>Cuenta destino:</label>
                        <input type="text" name="destino" placeholder="Número de cuenta" required>
                        
                        <label>Monto ($):</label>
                        <input type="number" name="monto" placeholder="Cantidad a transferir" min="1" required>
                        
                        <button type="submit">Transferir Dinero</button>
                    </form>
                    
                    <div class="warning">
                        <span class="warning-icon">⚠️</span>
                        <strong>NOTA EDUCATIVA:</strong> Este formulario es vulnerable a CSRF. 
                        No tiene token de protección y la cookie no tiene el atributo SameSite.
                    </div>
                </div>
                
                ${transferencias.length > 0 ? `
                <div class="card">
                    <h2>📋 Últimas Transferencias</h2>
                    <ul>
                        ${transferencias.slice(-5).reverse().map(t => 
                            `<li>$${t.monto} → ${t.destino} (${t.fecha})</li>`
                        ).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </body>
        </html>
    `);
});

// ==========================================
// 🚨 RUTA VULNERABLE A CSRF 🚨
// ==========================================
app.post('/transferir', verificarSesion, csrfProtection, (req, res) => {
    const usuario = req.usuario;
    const { destino, monto } = req.body;
    const cantidad = parseInt(monto);
    
    // ⚠️ VULNERABILIDAD: Solo verifica la cookie de sesión
    // NO verifica token CSRF
    // NO verifica el origen de la petición
    // NO verifica el referer
    
    if (cantidad > 0 && cantidad <= usuarios[usuario].saldo) {
        usuarios[usuario].saldo -= cantidad;
        
        // Registrar transferencia
        transferencias.push({
            usuario: usuario,
            destino: destino,
            monto: cantidad,
            fecha: new Date().toLocaleString()
        });
        
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Transferencia Exitosa</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f5f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                    }
                    .success-box {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        text-align: center;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .checkmark {
                        font-size: 60px;
                    }
                    h1 {
                        color: #27ae60;
                    }
                    .details {
                        background: #f0f0f0;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    a {
                        color: #1e3c72;
                        text-decoration: none;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="success-box">
                    <div class="checkmark">✅</div>
                    <h1>¡Transferencia Exitosa!</h1>
                    <div class="details">
                        <p><strong>Monto:</strong> $${cantidad}</p>
                        <p><strong>Destino:</strong> ${destino}</p>
                        <p><strong>Nuevo saldo:</strong> $${usuarios[usuario].saldo}</p>
                    </div>
                    <a href="/">← Volver al inicio</a>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <h1>❌ Error en la transferencia</h1>
            <p>Saldo insuficiente o monto inválido</p>
            <a href="/">Volver</a>
        `);
    }
});

// ==========================================
// LOGOUT
// ==========================================
app.get('/logout', (req, res) => {
    res.clearCookie('sesion');
    res.redirect('/login');
});
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        // Token CSRF inválido o inexistente
        return res.status(403).send(`
            <h1>🚫 Ataque CSRF Bloqueado</h1>
            <p>Se detectó una petición sin token CSRF válido.</p>
            <p><strong>Acción cancelada por seguridad.</strong></p>
            <a href="/">Volver al banco</a>
        `);
    }
    next(err);
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🏦 BANCO POLI - Laboratorio CSRF');
    console.log('='.repeat(50));
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log('📝 Credenciales: estudiante / 1234');
    console.log('⚠️  Este servidor es VULNERABLE a CSRF');
    console.log('='.repeat(50));
});
