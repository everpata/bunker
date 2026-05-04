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

if (typeof DEEPFALL_DATA === "undefined") {
    alert("🔥 ERROR CRÍTICO: datos.js no detectado.");
}

auth.onAuthStateChanged((user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const userRef = db.collection("usuarios").doc(user.uid);

    userRef.get().then((doc) => {
        if (!doc.exists) { window.location.href = "index.html"; return; }
        const data = doc.data();

        // 🛡️ ESCUDO DE SEGURIDAD (ANTI-SALTOS)
        let nA = parseInt(leccionId) || 0;
        let nG = data.leccion_actual_DF ? (parseInt(data.leccion_actual_DF.match(/\d+/)) || 0) : 0;
        
        if (!leccionId) {
            window.location.href = `bunker.html?id=${nG || 1}`;
            return;
        }

        // Si intenta acceder a una lección mayor a la guardada (y no es la lección 1 inicial)
        if (data.estado !== "Finalizado_DF" && nA > nG && !(nA === 1 && nG === 0)) {
            alert(`🛡️ Acceso denegado a la coordenada ${nA}. Volviendo a tu nivel actual.`);
            window.location.href = `bunker.html?id=${nG || 1}`;
            return;
        }

        const leccionData = DEEPFALL_DATA[leccionId];
        if(!leccionData) { 
            document.getElementById("loading-screen").style.display = "none";
            return; 
        }

        const workArea = document.getElementById("dynamic-work-area");
        workArea.style.width = "100%"; // SOLUCIÓN ERRORES 4, 6 Y 7: Fuerza el ancho total
        
        const btnMando = document.getElementById("btn-mando");
        const uiLogo = document.getElementById("ui-logo");
        const uiIndicator = document.getElementById("ui-indicator");
        const uiProgress = document.getElementById("ui-progress");
        const uiTitle = document.getElementById("ui-title");
        const uiDesc = document.getElementById("ui-desc");

        document.body.classList.remove('revealed');
        if(btnMando) { btnMando.style.display = "none"; btnMando.className = "btn-mando"; }
        if(countdownInterval) clearInterval(countdownInterval);
        let isLocked = false;

        // --- TIPO: CANDADO (SOLUCIÓN ERROR 9) ---
        if (leccionData.tipo === "candado") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `
                <img src="candado.webp" class="relic-image" style="width:120px; margin: 0 auto 20px auto; display:block; animation: pulse-logo 1.8s infinite ease-in-out;">
                <p class="text-base" style="text-align:center;">La siguiente ruta será liberada en:</p>
                <div id="countdown" style="display:flex; justify-content:center; gap:12px; margin-top:10px; width:100%;">
                    <div style="background:#f5f5f7; padding:20px 10px; border-radius:16px; text-align:center; flex:1;"><span style="display:block; font-size:26px; font-weight:800; color:#333;" id="hrs">00</span><span style="font-size:10px; color:#878787; text-transform:uppercase;">Hrs</span></div>
                    <div style="background:#f5f5f7; padding:20px 10px; border-radius:16px; text-align:center; flex:1;"><span style="display:block; font-size:26px; font-weight:800; color:#333;" id="min">00</span><span style="font-size:10px; color:#878787; text-transform:uppercase;">Min</span></div>
                    <div style="background:#f5f5f7; padding:20px 10px; border-radius:16px; text-align:center; flex:1;"><span style="display:block; font-size:26px; font-weight:800; color:#333;" id="seg">00</span><span style="font-size:10px; color:#878787; text-transform:uppercase;">Seg</span></div>
                </div>`;
            btnMando.style.display = "block"; btnMando.innerText = "Actualizar Protocolo →";
            btnMando.onclick = () => window.location.reload(true);
            const releaseDate = new Date(leccionData.fechaLiberacion).getTime();
            countdownInterval = setInterval(() => {
                const now = new Date().getTime(); const dist = releaseDate - now;
                if (dist < 0) { clearInterval(countdownInterval); btnMando.innerText = "Ingresar al siguiente tramo →"; btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`; }
                else {
                    document.getElementById("hrs").innerText = Math.floor(dist / 3600000).toString().padStart(2,"0");
                    document.getElementById("min").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2,"0");
                    document.getElementById("seg").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2,"0");
                }
            }, 1000);

        // --- TIPO: REPORTE FINAL (SOLUCIÓN ERROR 10) ---
        } else if (leccionData.tipo === "reporte") {
            userRef.update({ leccion_actual_DF: "bunker.html?id=10", estado: "Finalizado_DF" });
            [uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `
                <span style="font-size:11px; font-weight:600; color:#878787; letter-spacing:1.5px; margin-bottom:5px; display:block;">ESTATUS ACTUAL</span>
                <h1 class="title" style="margin-bottom:20px;">Máscara Rota.</h1>
                <div class="work-area card" style="margin-bottom:35px;">
                    <p class="text-base" style="margin:0; color:#333;">
                        <b>Diagnóstico Crítico:</b><br><br>Tu capacidad para mentirte ha sido neutralizada. El saboteador invisible ha sido expuesto y eliminado.<br><br><b>Orden:</b> La superficie ya no puede sostenerte. Inicia la inmersión al Tramo 02 de inmediato.
                    </p>
                </div>
                <button id="btn-upsell" class="btn-status-alert" style="display:block; width:100%;">AVANZAR AL TRAMO 02 →</button>
            `;
            document.getElementById("btn-upsell").onclick = () => window.location.href = leccionData.linkUpsell;

        // --- TIPO: PRINCIPIO ---
        } else if (leccionData.tipo === "principio") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `<div id="pantalla-reliquia" class="interruption-screen"><img src="${leccionData.imgReliquia}" class="relic-image"><p class="indicator">${leccionData.textoToque || "Toca para desenterrar"}</p></div><div class="revelation-screen"><div class="logo"><img src="DF.png"></div><p class="indicator">${leccionData.indicador}</p><div class="work-area card"><span class="principle-statement">${leccionData.principio}</span><p class="text-base">${leccionData.contenido}</p></div></div>`;
            document.getElementById("pantalla-reliquia").onclick = () => { document.body.classList.add('revealed'); btnMando.style.display = "block"; };
            btnMando.innerText = leccionData.btnTexto || "Asimilado →";
            btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`;

        // --- TIPO: HUB (SOLUCIÓN ERROR 8) ---
        } else if (leccionData.tipo === "hub") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "block"));
            uiIndicator.innerText = leccionData.indicador;
            uiProgress.style.width = leccionData.progreso;
            uiTitle.innerHTML = leccionData.titulo;
            uiDesc.innerHTML = leccionData.descripcion || "";
            
            // Botones del Hub en formato de lista ancha
            let hubHTML = leccionData.lecciones.map(l => `
                <button class="option-btn" style="text-align:left; padding:20px; display:flex; justify-content:space-between; align-items:center;" onclick="window.location.href='bunker.html?id=${l.id}'">
                    <div>
                        <span style="display:block; font-size:10px; color:#878787; margin-bottom:5px;">${l.tag}</span>
                        <span style="display:block; font-size:16px; font-weight:700; color:#333;">${l.titulo}</span>
                    </div>
                    <span style="color:#878787;">→</span>
                </button>
            `).join("");
            
            workArea.innerHTML = `<div class="work-area" style="width:100%;">${hubHTML}</div>`;
            btnMando.style.display = "block"; btnMando.className = "btn-ghost"; btnMando.innerText = leccionData.btnTexto || "Volver al flujo →";
            btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`;

        // --- TIPOS ESTÁNDAR ---
        } else {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "block"));
            uiIndicator.innerText = leccionData.indicador;
            uiProgress.style.width = leccionData.progreso;
            uiTitle.innerHTML = leccionData.titulo;
            uiDesc.innerHTML = leccionData.descripcion || "";
            btnMando.style.display = "block";
            btnMando.innerText = leccionData.btnTexto || "Continuar →";

            if (leccionData.tipo === "texto") {
                workArea.innerHTML = `<div class="work-area card">${leccionData.contenido}</div>`;
            } else if (leccionData.tipo === "imagen") {
                workArea.innerHTML = `<img src="${leccionData.url}" class="evidence-image">`;
            } else if (leccionData.tipo === "video") {
                // SOLUCIÓN ERROR 5: Texto dentro de la caja gris
                workArea.innerHTML = `<div class="video-container"><iframe src="${leccionData.url}" allowfullscreen></iframe></div>${leccionData.postTexto ? `<div class="work-area card" style="margin-top:15px;"><p class="text-base" style="margin:0;">${leccionData.postTexto}</p></div>` : ""}`;
            } else if (leccionData.tipo === "carrusel") {
                let items = leccionData.items.map(item => `<div class="carousel-item">${item.img ? `<img src="${item.img}" class="evidence-image">` : ""}<p class="text-base">${item.texto}</p></div>`).join("");
                workArea.innerHTML = `<div class="carousel-container">${items}</div>`;
            } else if (leccionData.tipo === "bitacora") {
                workArea.innerHTML = `<div class="work-area card"><textarea id="input-dinamico" placeholder="${leccionData.placeholder}"></textarea></div>`;
                if(data[`bitacora_${leccionId}`]) { const i = document.getElementById("input-dinamico"); i.value = data[`bitacora_${leccionId}`]; i.readOnly = true; i.classList.add("locked"); isLocked = true; }
            } else if (leccionData.tipo === "quiz") {
                workArea.innerHTML = `<div class="work-area">${leccionData.opciones.map(op => `<button class="option-btn" onclick="toggleOption(this)">${op}</button>`).join("")}</div>`;
                if(data[`quiz_${leccionId}`]) { document.querySelectorAll(".option-btn").forEach(b => { if(data[`quiz_${leccionId}`].includes(b.innerText.trim())) b.classList.add("selected"); }); isLocked = true; btnMando.innerText = "REGISTRO SELLADO ✓"; }
            }

            let urlSig = `bunker.html?id=${leccionData.siguienteId}`;
            btnMando.onclick = () => {
                if (isLocked || ["texto", "video", "imagen", "carrusel"].includes(leccionData.tipo)) {
                    // Evitamos sobreescribir la base de datos en tarjetas que no son interactivas
                    if (data.estado !== "Finalizado_DF" && nA === nG) {
                        userRef.update({ leccion_actual_DF: urlSig }).then(() => window.location.href = urlSig);
                    } else {
                        window.location.href = urlSig;
                    }
                    return;
                }
                const txt = document.getElementById("input-dinamico") ? document.getElementById("input-dinamico").value : "";
                const sel = Array.from(document.querySelectorAll(".option-btn.selected")).map(b => b.innerText.trim());
                if(leccionData.tipo === "bitacora" && !txt.trim()) return alert("El búnker exige tu respuesta.");
                if(leccionData.tipo === "quiz" && !sel.length) return alert("Toma una decisión.");
                
                const update = leccionData.tipo === "bitacora" ? { [`bitacora_${leccionId}`]: txt, leccion_actual_DF: urlSig } : { [`quiz_${leccionId}`]: sel, leccion_actual_DF: urlSig };
                userRef.update(update).then(() => window.location.href = urlSig);
            };
        }

        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("bunker-content").style.display = "flex";
    }).catch(err => { console.error(err); });
});
