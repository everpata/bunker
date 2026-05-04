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

function toggleOption(btn) { 
    if(!btn.classList.contains("locked")) { btn.classList.toggle("selected"); }
}

function enableMouseDrag() {
    const slider = document.querySelector('.carousel-container');
    if (!slider || slider.dataset.dragEnabled === "true") return;
    let isDown = false; let startX; let scrollLeft;
    slider.style.cursor = 'grab'; slider.dataset.dragEnabled = "true";
    slider.addEventListener('mousedown', (e) => {
        isDown = true; slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
        if(e.target.tagName === 'IMG') e.preventDefault();
    });
    slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = 'grab'; });
    slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = 'grab'; });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return; e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2.5; slider.scrollLeft = scrollLeft - walk;
    });
}

const observer = new MutationObserver(() => {
    if (document.querySelector('.carousel-container')) { enableMouseDrag(); }
});
observer.observe(document.getElementById('dynamic-work-area'), { childList: true, subtree: true });

auth.onAuthStateChanged((user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const userRef = db.collection("usuarios").doc(user.uid);

    userRef.get().then((doc) => {
        const data = doc.exists ? doc.data() : {};
        let nA = parseInt(leccionId) || 0;
        let nG = data.leccion_actual_DF ? (parseInt(data.leccion_actual_DF.toString().match(/\d+/)) || 0) : 0;
        
        if (!leccionId) { window.location.href = `bunker.html?id=${nG > 0 ? nG : 1}`; return; }
        if (data.estado !== "Finalizado_DF" && nA > nG && !(nA === 1 && nG === 0)) {
            window.location.href = `bunker.html?id=${nG > 0 ? nG : 1}`; return;
        }

        const leccionData = DEEPFALL_DATA[leccionId];
        if(!leccionData) { document.getElementById("loading-screen").style.display = "none"; return; }

        const workArea = document.getElementById("dynamic-work-area");
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

        // --- TIPO: PERFIL ---
        if (leccionData.tipo === "perfil") {
            [uiIndicator, uiProgress.parentElement].forEach(el => el && (el.style.display = "none"));
            uiTitle.innerHTML = leccionData.titulo; uiDesc.innerHTML = leccionData.descripcion || "";
            let profileLocked = (data.edad && data.ocupacion && data.telefono);
            workArea.innerHTML = `
                <div class="work-area card">
                    <input type="number" id="p-edad" class="input-line ${profileLocked ? 'locked' : ''}" placeholder="Edad" value="${data.edad || ''}" ${profileLocked ? 'readonly' : ''}>
                    <input type="text" id="p-ocupacion" class="input-line ${profileLocked ? 'locked' : ''}" placeholder="Ocupación" value="${data.ocupacion || ''}" ${profileLocked ? 'readonly' : ''}>
                    <input type="tel" id="p-telefono" class="${profileLocked ? 'locked' : ''}" value="${data.telefono || ''}" ${profileLocked ? 'readonly' : ''}>
                </div>`;

            let phoneInput;
            if(window.intlTelInput) {
                phoneInput = window.intlTelInput(document.querySelector("#p-telefono"), {
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
                    initialCountry: "auto",
                    geoIpLookup: function(success) { fetch("https://ipapi.co/json").then(res => res.json()).then(geo => success(geo.country_code)).catch(() => success("us")); },
                    separateDialCode: true
                });
            }
            if (profileLocked) {
                setTimeout(() => {
                    const iti = document.querySelector(".iti");
                    if(iti) iti.classList.add("locked");
                    document.querySelector(".iti__input").setAttribute("readonly", true);
                }, 50);
            }
            btnMando.style.display = "block";
            btnMando.innerText = profileLocked ? "IDENTIDAD CONFIRMADA ✓" : (leccionData.btnTexto || "Registrar Identidad →");
            btnMando.onclick = () => {
                if (profileLocked) { window.location.href = `bunker.html?id=${leccionData.siguienteId}`; return; }
                const edad = document.getElementById("p-edad").value;
                const ocup = document.getElementById("p-ocupacion").value;
                const tel = phoneInput ? phoneInput.getNumber() : document.getElementById("p-telefono").value;
                if(!edad || !ocup || !tel) return alert("Datos incompletos.");
                userRef.update({ edad, ocupacion, telefono: tel, leccion_actual_DF: leccionData.siguienteId })
                .then(() => window.location.href = `bunker.html?id=${leccionData.siguienteId}`);
            };

        // --- TIPO: CANDADO ---
        } else if (leccionData.tipo === "candado") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `<img src="candado.webp" class="relic-image-lock"><p class="text-base" style="text-align:center;">Liberación en:</p><div id="countdown" style="display:flex; justify-content:center; gap:12px; margin-top:10px;"><div style="background:#f5f5f7; padding:20px 10px; border-radius:16px; text-align:center; flex:1;"><span id="hrs" style="display:block; font-size:26px; font-weight:800;">00</span><span style="font-size:10px; color:#878787;">Hrs</span></div><div style="background:#f5f5f7; padding:20px 10px; border-radius:16px; text-align:center; flex:1;"><span id="min" style="display:block; font-size:26px; font-weight:800;">00</span><span style="font-size:10px; color:#878787;">Min</span></div><div style="background:#f5f5f7; padding:20px 10px; border-radius:16px; text-align:center; flex:1;"><span id="seg" style="display:block; font-size:26px; font-weight:800;">00</span><span style="font-size:10px; color:#878787;">Seg</span></div></div>`;
            btnMando.style.display = "block"; btnMando.innerText = "Actualizar Protocolo →";
            btnMando.onclick = () => window.location.reload(true);
            const release = new Date(leccionData.fechaLiberacion).getTime();
            countdownInterval = setInterval(() => {
                const dist = release - new Date().getTime();
                if (dist < 0) { clearInterval(countdownInterval); btnMando.innerText = "Ingresar →"; btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`; }
                else {
                    document.getElementById("hrs").innerText = Math.floor(dist / 3600000).toString().padStart(2,"0");
                    document.getElementById("min").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2,"0");
                    document.getElementById("seg").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2,"0");
                }
            }, 1000);

        // --- TIPO: REPORTE ---
        } else if (leccionData.tipo === "reporte") {
            userRef.update({ leccion_actual_DF: leccionId, estado: "Finalizado_DF" });
            [uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `<h1 class="title">Máscara Rota.</h1><div class="work-area card" style="margin-bottom:35px;"><p class="text-base"><b>Diagnóstico:</b> Tu capacidad para mentirte ha sido neutralizada.</p></div><button id="btn-upsell" class="btn-status-alert">AVANZAR AL TRAMO 02 →</button>`;
            document.getElementById("btn-upsell").onclick = () => window.location.href = leccionData.linkUpsell;

        // --- TIPO: PRINCIPIO ---
        } else if (leccionData.tipo === "principio") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `<div id="pantalla-reliquia" class="interruption-screen"><img src="${leccionData.imgReliquia}" class="relic-image"><p class="indicator">${leccionData.textoToque || "Toca para desenterrar"}</p></div><div class="revelation-screen"><div class="logo"><img src="DF.png"></div><p class="indicator" style="margin-bottom:32px;">${leccionData.indicador}</p><div class="work-area card"><span class="principle-statement">${leccionData.principio}</span><p class="text-base">${leccionData.contenido}</p></div></div>`;
            document.getElementById("pantalla-reliquia").onclick = () => { document.body.classList.add('revealed'); btnMando.style.display = "block"; };
            btnMando.innerText = "Asimilado →"; btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`;

        // --- TIPO: HUB ---
        } else if (leccionData.tipo === "hub") {
            uiIndicator.innerText = leccionData.indicador; uiProgress.style.width = leccionData.progreso;
            uiTitle.innerHTML = leccionData.titulo; uiDesc.innerHTML = leccionData.descripcion || "";
            let hubHTML = leccionData.lecciones.map(l => `<button class="option-btn" style="padding:20px; display:flex; justify-content:space-between;" onclick="window.location.href='bunker.html?id=${l.id}'"><div><span style="display:block; font-size:10px; color:#878787; margin-bottom:5px;">${l.tag}</span><span style="font-size:16px; font-weight:700;">${l.titulo}</span></div><span>→</span></button>`).join("");
            workArea.innerHTML = `<div class="work-area" style="margin-bottom:25px;">${hubHTML}</div>`;
            btnMando.style.display = "block"; btnMando.className = "btn-ghost"; btnMando.innerText = "Volver al flujo →";
            btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`;

        // --- TIPOS ESTÁNDAR (CON AUDIO OPCIONAL) ---
        } else {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "block"));
            uiIndicator.innerText = leccionData.indicador; uiProgress.style.width = leccionData.progreso;
            uiTitle.innerHTML = leccionData.titulo; uiDesc.innerHTML = leccionData.descripcion || "";
            btnMando.style.display = "block"; btnMando.innerText = leccionData.btnTexto || "Continuar →";

            if (leccionData.tipo === "texto") {
                // Lógica de Audio Opcional
                let audioBtn = leccionData.audio ? `
                    <div class="audio-wrapper">
                        <audio id="audio-player" src="${leccionData.audio}"></audio>
                        <button class="btn-audio" onclick="const a=document.getElementById('audio-player'); a.paused?a.play():a.pause();">
                            ESCUCHAR LECCIÓN 
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-left:8px;"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                    </div>` : "";
                workArea.innerHTML = `<div class="work-area card">${leccionData.contenido} ${audioBtn}</div>`;
            } else if (leccionData.tipo === "imagen") {
                workArea.innerHTML = `<img src="${leccionData.url}" class="evidence-image">`;
            } else if (leccionData.tipo === "video") {
                workArea.innerHTML = `<div class="video-container"><iframe src="${leccionData.url}" allowfullscreen></iframe></div>${leccionData.postTexto ? `<div class="work-area card" style="margin-top:15px;"><p class="text-base">${leccionData.postTexto}</p></div>` : ""}`;
            } else if (leccionData.tipo === "carrusel") {
                workArea.innerHTML = `<div class="carousel-container">${leccionData.items.map(item => `<div class="carousel-item">${item.img ? `<img src="${item.img}" class="evidence-image">` : ""}<p class="text-base">${item.texto}</p></div>`).join("")}</div>`;
            } else if (leccionData.tipo === "bitacora") {
                workArea.innerHTML = `<div class="work-area card"><textarea id="input-dinamico" placeholder="${leccionData.placeholder}"></textarea></div>`;
                if(data[`bitacora_${leccionId}`]) { const i=document.getElementById("input-dinamico"); i.value=data[`bitacora_${leccionId}`]; i.readOnly=true; i.classList.add("locked"); isLocked=true; }
            } else if (leccionData.tipo === "quiz") {
                workArea.innerHTML = `<div class="work-area">${leccionData.opciones.map(op => `<button class="option-btn">${op}</button>`).join("")}</div>`;
                if(data[`quiz_${leccionId}`]) { 
                    document.querySelectorAll(".option-btn").forEach(b => { if(data[`quiz_${leccionId}`].includes(b.innerText.trim())) b.classList.add("selected"); b.classList.add("locked"); });
                    isLocked = true; btnMando.innerText = "REGISTRO SELLADO ✓"; 
                } else { document.querySelectorAll(".option-btn").forEach(b => b.onclick = () => toggleOption(b)); }
            }

            btnMando.onclick = () => {
                let urlSig = `bunker.html?id=${leccionData.siguienteId}`;
                if (isLocked || ["texto", "video", "imagen", "carrusel"].includes(leccionData.tipo)) {
                    if (data.estado !== "Finalizado_DF" && nA === nG) { userRef.update({ leccion_actual_DF: leccionData.siguienteId }).then(() => window.location.href = urlSig); }
                    else { window.location.href = urlSig; } return;
                }
                const txt = document.getElementById("input-dinamico") ? document.getElementById("input-dinamico").value : "";
                const sel = Array.from(document.querySelectorAll(".option-btn.selected")).map(b => b.innerText.trim());
                if(leccionData.tipo === "bitacora" && !txt.trim()) return alert("Completa tu registro.");
                if(leccionData.tipo === "quiz" && !sel.length) return alert("Toma una decisión.");
                userRef.update({ [leccionData.tipo === "bitacora" ? `bitacora_${leccionId}` : `quiz_${leccionId}`]: leccionData.tipo === "bitacora" ? txt : sel, leccion_actual_DF: leccionData.siguienteId })
                .then(() => window.location.href = urlSig);
            };
        }

        if (data.estado !== "Finalizado_DF" && nA > nG && !["perfil", "candado", "reporte"].includes(leccionData.tipo)) {
            userRef.update({ leccion_actual_DF: leccionId });
        }
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("bunker-content").style.display = "flex";
    }).catch(err => { console.error(err); document.getElementById("loading-screen").style.display = "none"; });
});
