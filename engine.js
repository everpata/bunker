// 1. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = { 
    apiKey: "AIzaSyARmU6NUnRajN8dMB6Pi35WbSC2ZKJd-X8", 
    authDomain: "deepfall-b3601.firebaseapp.com", 
    projectId: "deepfall-b3601", 
    storageBucket: "deepfall-b3601.firebasestorage.app", 
    messagingSenderId: "207043962011", 
    appId: "1:207043962011:web:681397c7d540b4b3d4523e" 
};
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();

const urlParams = new URLSearchParams(window.location.search);
let leccionId = urlParams.get("id");
let countdownInterval;

function toggleOption(btn) { btn.classList.toggle("selected"); }

// Alerta si datos.js falla
if (typeof DEEPFALL_DATA === "undefined") {
    alert("🔥 ERROR CRÍTICO: El archivo datos.js no cargó. Revisa si falta una coma o llave.");
}

auth.onAuthStateChanged((user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const userRef = db.collection("usuarios").doc(user.uid);

    userRef.get().then((doc) => {
        if (!doc.exists) { window.location.href = "index.html"; return; }
        const data = doc.data();

        // GPS Seguro para el Index
        if (!leccionId) {
            let guardada = "34"; 
            if (data.leccion_actual_DF) {
                const match = String(data.leccion_actual_DF).match(/\d+/);
                if (match) guardada = match[0];
            }
            window.location.href = `bunker.html?id=${guardada}`;
            return;
        }

        const leccionData = DEEPFALL_DATA[leccionId];
        if(!leccionData) { 
            document.getElementById("loading-screen").style.display = "none";
            return; 
        }

        const workArea = document.getElementById("dynamic-work-area");
        const btnMando = document.getElementById("btn-mando");
        const uiLogo = document.getElementById("ui-logo");
        const uiIndicator = document.getElementById("ui-indicator");
        const uiProgress = document.getElementById("ui-progress");
        const uiTitle = document.getElementById("ui-title");
        const uiDesc = document.getElementById("ui-desc");

        // Limpieza de estado previo
        if(btnMando) {
            btnMando.style.display = "none";
            btnMando.className = "btn-mando";
        }
        if(countdownInterval) clearInterval(countdownInterval);
        let isLocked = false;

        // --- TIPO: CANDADO ---
        if (leccionData.tipo === "candado") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            
            workArea.innerHTML = `
                <img src="candado.webp" class="relic-lock-img" alt="Protocolo Bloqueado">
                <p class="text-base" style="text-align:center;">La siguiente ruta será liberada en:</p>
                <div id="countdown" class="stats-container">
                    <div class="stat-box"><span class="stat-value" id="hrs">00</span><span class="stat-label">Horas</span></div>
                    <div class="stat-box"><span class="stat-value" id="min">00</span><span class="stat-label">Minutos</span></div>
                    <div class="stat-box"><span class="stat-value" id="seg">00</span><span class="stat-label">Segundos</span></div>
                </div>
            `;
            btnMando.style.display = "block";
            btnMando.innerText = "Actualizar Protocolo →";
            btnMando.onclick = () => window.location.reload(true);

            const releaseDate = new Date(leccionData.fechaLiberacion).getTime();
            countdownInterval = setInterval(() => {
                const now = new Date().getTime(); const dist = releaseDate - now;
                if (dist < 0) {
                    clearInterval(countdownInterval);
                    btnMando.innerText = "Ingresar al siguiente tramo →";
                    btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`;
                } else {
                    const h = Math.floor(dist / 3600000);
                    const m = Math.floor((dist % 3600000) / 60000);
                    const s = Math.floor((dist % 60000) / 1000);
                    if(document.getElementById("hrs")) document.getElementById("hrs").innerText = h.toString().padStart(2,"0");
                    if(document.getElementById("min")) document.getElementById("min").innerText = m.toString().padStart(2,"0");
                    if(document.getElementById("seg")) document.getElementById("seg").innerText = s.toString().padStart(2,"0");
                }
            }, 1000);

        // --- TIPO: REPORTE FINAL ---
        } else if (leccionData.tipo === "reporte") {
            if (data.access_DM === true || data.access_DQ === true) {
                window.location.href = data.leccion_actual_DM || "bunker.html?id=64";
                return;
            }

            userRef.update({ leccion_actual_DF: "bunker.html?id=63", estado: "Finalizado_DF" });

            [uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            const nombreExp = (data.nombre || "SIN NOMBRE").toUpperCase();

            workArea.innerHTML = `
                <span id="nombre-exp">EXPEDICIONARIO: ${nombreExp}</span>
                <div class="status-badge">ESTATUS: MÁSCARA ROTA</div>
                <h1 class="title">Fin del Descenso.</h1>
                <p class="description">Análisis final del Tramo 01 completado.</p>
                <div class="card" style="text-align:left; padding:24px; background:#f5f5f7; border-radius:16px; margin-bottom: 35px; line-height: 1.6;">
                    <p class="text-base" style="margin:0; color: #333;">
                        <b>Diagnóstico Crítico:</b><br>
                        Tu capacidad para mentirte ha sido neutralizada. La <b>máscara</b> de superficie que solías usar para protegerte del escrutinio ajeno ha sufrido una fractura irreparable; ya no hay vuelta atrás hacia la comodidad de la forma.<br><br>
                        El <b>saboteador invisible</b>, ese mecanismo interno que disparaba tu desconfianza y te hacía retroceder antes de actuar, ha sido expuesto. Al identificarlo, le has quitado el oxígeno. El <b>lastre</b> de la aprobación externa ha sido soltado en las profundidades: ahora eres más ligero para maniobrar, pero más denso para impactar.<br><br>
                        <b>Orden:</b> La superficie ya no puede sostenerte. Debes iniciar la <b>Inmersión (Tramo 02)</b> de inmediato para evitar el colapso operativo por falta de presión interna.
                    </p>
                </div>
                <p class="text-base" style="margin-top: 35px; margin-bottom: -20px; text-align:center; width:100%;"><b>La escotilla de acceso cierra en:</b></p>
                <div id="countdown" class="stats-container">
                    <div class="stat-box"><span class="stat-value" id="hrs">00</span><span class="stat-label">Horas</span></div>
                    <div class="stat-box"><span class="stat-value" id="min">00</span><span class="stat-label">Minutos</span></div>
                    <div class="stat-box"><span class="stat-value" id="seg">00</span><span class="stat-label">Segundos</span></div>
                </div>
                <button id="btn-upsell-dinamico" class="btn-status-alert" style="display:block !important;">AVANZAR AL TRAMO 02 →</button>
            `;
            
            document.getElementById("btn-upsell-dinamico").onclick = () => window.location.href = leccionData.linkUpsell;

            const tDate = new Date(leccionData.fechaExpiracion).getTime();
            countdownInterval = setInterval(() => {
                const now = new Date().getTime(); const dist = tDate - now;
                if (dist < 0) { document.getElementById("countdown").innerHTML = "EXPIRADO"; return; }
                const h = Math.floor(dist / 3600000);
                const m = Math.floor((dist % 3600000) / 60000);
                const s = Math.floor((dist % 60000) / 1000);
                if(document.getElementById("hrs")) document.getElementById("hrs").innerText = h.toString().padStart(2,"0");
                if(document.getElementById("min")) document.getElementById("min").innerText = m.toString().padStart(2,"0");
                if(document.getElementById("seg")) document.getElementById("seg").innerText = s.toString().padStart(2,"0");
            }, 1000);

        // --- TIPO: LECCIONES ESTÁNDAR ---
        } else {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "block"));
            uiIndicator.innerText = leccionData.indicador;
            uiProgress.style.width = leccionData.progreso;
            uiTitle.innerHTML = leccionData.titulo;
            uiDesc.innerHTML = leccionData.descripcion || "";
            btnMando.style.display = "block";
            btnMando.innerText = leccionData.btnTexto || "Continuar →";

            if (leccionData.tipo === "texto") {
                workArea.innerHTML = `<div class="card">${leccionData.contenido}</div>`;
            } else if (leccionData.tipo === "video") {
                workArea.innerHTML = `<div class="video-container"><iframe src="${leccionData.url}" style="border:0; position:absolute; top:0; left:0; width:100%; height:100%; border-radius:16px;" allowfullscreen></iframe></div>${leccionData.postTexto ? `<div class="post-video-box"><p>${leccionData.postTexto}</p></div>` : ""}`;
            } else if (leccionData.tipo === "bitacora") {
                workArea.innerHTML = `<div class="card"><textarea id="input-dinamico" placeholder="${leccionData.placeholder}"></textarea></div>`;
                if(data[`bitacora_${leccionId}`]) {
                    const i = document.getElementById("input-dinamico");
                    i.value = data[`bitacora_${leccionId}`]; i.readOnly = true; i.classList.add("locked"); isLocked = true;
                }
            } else if (leccionData.tipo === "quiz") {
                workArea.innerHTML = leccionData.opciones.map(op => `<button class="option-btn" onclick="toggleOption(this)">${op}</button>`).join("");
                if(data[`quiz_${leccionId}`]) {
                    document.querySelectorAll(".option-btn").forEach(b => { if(data[`quiz_${leccionId}`].includes(b.innerText.trim())) b.classList.add("selected"); });
                    isLocked = true; btnMando.classList.add("btn-disabled"); btnMando.innerText = "REGISTRO SELLADO ✓";
                }
            }

            let urlSig = leccionData.siguienteId.includes(".html") ? leccionData.siguienteId : `bunker.html?id=${leccionData.siguienteId}`;
            btnMando.onclick = () => {
                if (isLocked || leccionData.tipo === "texto" || leccionData.tipo === "video") return window.location.href = urlSig;
                const txt = document.getElementById("input-dinamico") ? document.getElementById("input-dinamico").value : "";
                const sel = Array.from(document.querySelectorAll(".option-btn.selected")).map(b => b.innerText.trim());
                if(leccionData.tipo === "bitacora" && !txt.trim()) return alert("El búnker exige tu respuesta.");
                if(leccionData.tipo === "quiz" && !sel.length) return alert("Toma una decisión.");
                
                const update = leccionData.tipo === "bitacora" ? { [`bitacora_${leccionId}`]: txt, leccion_actual_DF: urlSig } : { [`quiz_${leccionId}`]: sel, leccion_actual_DF: urlSig };
                userRef.update(update).then(() => window.location.href = urlSig);
            };

            // Lógica Egresado: Botón Rojo si ya terminó el DF
            if (data.estado === "Finalizado_DF" && !data.access_DM && isLocked) {
                btnMando.innerText = "Ir al Reporte Final →";
                btnMando.classList.add("btn-status-alert");
                btnMando.style.display = "block";
                btnMando.onclick = () => window.location.href = "bunker.html?id=63";
            }
        }

        // GPS Seguro: Almacenamiento de ruta completa
        const nA = parseInt(leccionId) || 0;
        const nG = data.leccion_actual_DF ? (parseInt(data.leccion_actual_DF.match(/\d+/)) || 0) : 0;
        if (data.estado !== "Finalizado_DF" && !data.access_DM && nA > nG) {
            userRef.update({ leccion_actual_DF: `bunker.html?id=${leccionId}` });
        }

        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("bunker-content").style.display = "flex";
    }).catch(err => { console.error(err); document.getElementById("loading-screen").style.display = "none"; });
});
