# 🏦 Banco Poli - Laboratorio de CSRF

## Descripción
Este es un laboratorio educativo para demostrar ataques **Cross-Site Request Forgery (CSRF)** en una exposición universitaria.

## 🚀 Cómo ejecutar

### Requisitos
- Docker
- Docker Compose

### Iniciar el laboratorio
```bash
docker-compose up --build
```

### URLs de acceso
| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🏦 Banco Poli | http://localhost:8080 | Aplicación bancaria vulnerable |
| 😈 Sitio Hacker | http://localhost:9090 | Sitio malicioso con ataque CSRF |

## 📝 Credenciales del Banco
- **Usuario:** estudiante
- **Contraseña:** 1234
- **Saldo inicial:** $1,000

## 🎯 Demostración del Ataque

### Paso 1: Iniciar sesión en el banco
1. Abrir http://localhost:8080
2. Iniciar sesión con las credenciales
3. Verificar el saldo de $1,000

### Paso 2: Visitar el sitio malicioso
1. **Sin cerrar sesión del banco**, abrir una nueva pestaña
2. Visitar http://localhost:9090
3. Hacer clic en "¡RECLAMAR MI PREMIO!"

### Paso 3: Verificar el ataque
1. Volver a http://localhost:8080
2. ¡El saldo ahora es de $500!
3. Se transfirió dinero sin tu consentimiento 😱

## 🔍 ¿Por qué funciona el ataque?

### Vulnerabilidades presentes:
1. **Sin token CSRF:** El formulario de transferencia no tiene un token de verificación
2. **Cookie sin SameSite:** La cookie de sesión no tiene el atributo `SameSite`
3. **Sin verificación de origen:** No se verifica el header `Origin` o `Referer`

### Código del ataque (en hacker-site):
```html
<form action="http://localhost:8080/transferir" method="POST">
    <input type="hidden" name="destino" value="HACKER-666">
    <input type="hidden" name="monto" value="500">
</form>
```

## 🛡️ Cómo prevenir CSRF

### 1. Tokens CSRF
```javascript
// Generar token único por sesión
const csrfToken = crypto.randomBytes(32).toString('hex');

// Verificar en cada POST
if (req.body.csrf_token !== req.session.csrfToken) {
    return res.status(403).send('Token CSRF inválido');
}
```

### 2. Atributo SameSite en cookies
```javascript
res.cookie('sesion', usuario, {
    httpOnly: true,
    sameSite: 'Strict'  // o 'Lax'
});
```

### 3. Verificar headers Origin/Referer
```javascript
const origin = req.headers.origin || req.headers.referer;
if (!origin.startsWith('http://localhost:8080')) {
    return res.status(403).send('Origen no permitido');
}
```

## 📊 Estructura del proyecto
```
banco-poli-csrf/
├── docker-compose.yml      # Orquestación de contenedores
├── README.md               # Este archivo
├── server-banco/
│   ├── app.js              # Servidor Express vulnerable
│   ├── package.json        # Dependencias Node.js
│   └── Dockerfile          # Imagen del banco
└── hacker-site/
    ├── index.html          # Sitio malicioso
    └── Dockerfile          # Imagen del hacker
```

## ⚠️ Advertencia
Este laboratorio es **SOLO PARA FINES EDUCATIVOS**. Nunca utilices estas técnicas en sistemas reales sin autorización.

## 👥 Créditos
Desarrollado para la clase de Ciberseguridad - Escuela Politécnica Nacional
