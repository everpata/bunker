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

auth.onAuthStateChanged((user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const userRef = db.collection("usuarios").doc(user.uid);

    userRef.get().then((doc) => {
        if (!doc.exists) { window.location.href = "index.html"; return; }
        const data = doc.data();

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

        // --- LIMPIEZA Y RESET DE ESTADOS ---
        document.body.classList.remove('revealed'); // Quita la revelación previa
        if(btnMando) { btnMando.style.display = "none"; btnMando.className = "btn-mando"; }
        if(countdownInterval) clearInterval(countdownInterval);
        let isLocked = false;

        // --- TIPO: CANDADO ---
        if (leccionData.tipo === "candado") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `<img src="candado.webp" class="relic-lock-img" style="width:100%;"><p class="text-base" style="text-align:center;">Liberación en:</p><div id="countdown" class="stats-hud" style="display:grid;"><div class="hud-item"><span class="hud-value" id="hrs">00</span><span class="hud-label">Hrs</span></div><div class="hud-item"><span class="hud-value" id="min">00</span><span class="hud-label">Min</span></div><div class="hud-item"><span class="hud-value" id="seg">00</span><span class="hud-label">Seg</span></div></div>`;
            btnMando.style.display = "block"; btnMando.innerText = "Actualizar Protocolo →";
            btnMando.onclick = () => window.location.reload(true);
            const releaseDate = new Date(leccionData.fechaLiberacion).getTime();
            countdownInterval = setInterval(() => {
                const now = new Date().getTime(); const dist = releaseDate - now;
                if (dist < 0) { clearInterval(countdownInterval); btnMando.innerText = "Ingresar →"; btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`; }
                else {
                    document.getElementById("hrs").innerText = Math.floor(dist / 3600000).toString().padStart(2,"0");
                    document.getElementById("min").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2,"0");
                    document.getElementById("seg").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2,"0");
                }
            }, 1000);

        // --- TIPO: REPORTE ---
        } else if (leccionData.tipo === "reporte") {
            userRef.update({ leccion_actual_DF: "bunker.html?id=63", estado: "Finalizado_DF" });
            [uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `<h1 class="title">Estatus: Máscara Rota</h1><div class="work-area card"><p class="text-base">Tu capacidad para mentirte ha sido neutralizada.</p></div><button id="btn-upsell" class="btn-status-alert" style="display:block;">AVANZAR AL TRAMO 02 →</button>`;
            document.getElementById("btn-upsell").onclick = () => window.location.href = leccionData.linkUpsell;

        // --- TIPO: PRINCIPIO (RITUAL DE REVELACIÓN) ---
        } else if (leccionData.tipo === "principio") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            
            workArea.innerHTML = `
                <div id="pantalla-reliquia" class="interruption-screen">
                    <img src="${leccionData.imgReliquia}" class="relic-image">
                    <p class="indicator">${leccionData.textoToque || "Toca para desenterrar"}</p>
                </div>
                <div class="revelation-screen">
                    <div class="logo"><img src="DF.png"></div>
                    <p class="indicator">${leccionData.indicador}</p>
                    <div class="work-area card">
                        <span class="principle-statement">${leccionData.principio}</span>
                        <p class="text-base">${leccionData.contenido}</p>
                    </div>
                </div>`;

            document.getElementById("pantalla-reliquia").onclick = () => {
                document.body.classList.add('revealed');
                btnMando.style.display = "block";
            };
            btnMando.innerText = leccionData.btnTexto || "Asimilado →";
            btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`;

        // --- LECCIONES ESTÁNDAR ---
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
            } 
            else if (leccionData.tipo === "imagen") {
                workArea.innerHTML = `<img src="${leccionData.url}" class="evidence-image">`;
            }
            else if (leccionData.tipo === "video") {
                workArea.innerHTML = `<div class="video-container"><iframe src="${leccionData.url}" allowfullscreen></iframe></div>${leccionData.postTexto ? `<p class="text-base" style="margin-top:15px;">${leccionData.postTexto}</p>` : ""}`;
            } 
            else if (leccionData.tipo === "carrusel") {
                let itemsHTML = leccionData.items.map(item => `
                    <div class="carousel-item">
                        ${item.img ? `<img src="${item.img}" class="evidence-image">` : ""}
                        <p class="text-base">${item.texto}</p>
                    </div>`).join("");
                workArea.innerHTML = `<div class="carousel-container">${itemsHTML}</div>`;
            }
            else if (leccionData.tipo === "bitacora") {
                workArea.innerHTML = `<div class="work-area card"><textarea id="input-dinamico" placeholder="${leccionData.placeholder}"></textarea></div>`;
                if(data[`bitacora_${leccionId}`]) {
                    const i = document.getElementById("input-dinamico");
                    i.value = data[`bitacora_${leccionId}`]; i.readOnly = true; i.classList.add("locked"); isLocked = true;
                }
            } 
            else if (leccionData.tipo === "quiz") {
                workArea.innerHTML = `<div class="work-area">${leccionData.opciones.map(op => `<button class="option-btn" onclick="toggleOption(this)">${op}</button>`).join("")}</div>`;
                if(data[`quiz_${leccionId}`]) {
                    document.querySelectorAll(".option-btn").forEach(b => { if(data[`quiz_${leccionId}`].includes(b.innerText.trim())) b.classList.add("selected"); });
                    isLocked = true; btnMando.innerText = "REGISTRO SELLADO ✓";
                }
            }

            let urlSig = `bunker.html?id=${leccionData.siguienteId}`;
            btnMando.onclick = () => {
                if (isLocked || ["texto", "video", "imagen", "carrusel"].includes(leccionData.tipo)) return window.location.href = urlSig;
                const txt = document.getElementById("input-dinamico") ? document.getElementById("input-dinamico").value : "";
                const sel = Array.from(document.querySelectorAll(".option-btn.selected")).map(b => b.innerText.trim());
                if(leccionData.tipo === "bitacora" && !txt.trim()) return alert("El búnker exige tu respuesta.");
                if(leccionData.tipo === "quiz" && !sel.length) return alert("Toma una decisión.");
                const update = leccionData.tipo === "bitacora" ? { [`bitacora_${leccionId}`]: txt, leccion_actual_DF: urlSig } : { [`quiz_${leccionId}`]: sel, leccion_actual_DF: urlSig };
                userRef.update(update).then(() => window.location.href = urlSig);
            };
        }

        // GPS Seguro
        const nA = parseInt(leccionId) || 0;
        const nG = data.leccion_actual_DF ? (parseInt(data.leccion_actual_DF.match(/\d+/)) || 0) : 0;
        if (data.estado !== "Finalizado_DF" && nA > nG) {
            userRef.update({ leccion_actual_DF: `bunker.html?id=${leccionId}` });
        }

        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("bunker-content").style.display = "flex";
    }).catch(err => { console.error(err); });
});
