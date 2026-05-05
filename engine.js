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

// --- UTILIDADES ---

function stopAllAudio() {
    const players = document.querySelectorAll('audio');
    players.forEach(p => { p.pause(); p.currentTime = 0; });
}

window.activateAudio = (id) => {
    const cap = document.getElementById(`capsule-${id}`);
    if(cap && !cap.classList.contains('active')) {
        cap.classList.add('active');
        window.togglePlay();
    }
};

window.togglePlay = () => {
    const a = document.getElementById('audio-player');
    const icon = document.getElementById('play-icon');
    if (a && icon) {
        if (a.paused) { a.play(); icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; }
        else { a.pause(); icon.innerHTML = '<path d="M8 5v14l11-7z"/>'; }
    }
};

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

        // RESETEO Y CABECERA (Normalizado: JS actualiza la cabecera por defecto)
        document.body.classList.remove('revealed');
        [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "block"));
        
        if(btnMando) { btnMando.style.display = "none"; btnMando.className = "btn-mando"; }
        if(countdownInterval) clearInterval(countdownInterval);
        let isLocked = false;

        const reportData = Object.values(DEEPFALL_DATA).find(l => l.tipo === "reporte") || {};
        const upsellLink = reportData.linkUpsell || "#";
        const hubLink = reportData.hubId ? `bunker.html?id=${reportData.hubId}` : `bunker.html?id=1`;

        // --- RENDERIZADO POR TIPO (JS solo inyecta HTML de Work Area y tokens de margen) ---

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
            const telEl = document.querySelector("#p-telefono");
            if(window.intlTelInput && telEl) {
                phoneInput = window.intlTelInput(telEl, {
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
                    const inp = document.querySelector(".iti__input");
                    if(inp) inp.setAttribute("readonly", true);
                }, 50);
            }
            btnMando.style.display = "block";
            btnMando.innerText = profileLocked ? "IDENTIDAD CONFIRMADA ✓" : (leccionData.btnTexto || "Registrar Identidad →");
            btnMando.onclick = () => {
                stopAllAudio();
                if (profileLocked) { window.location.href = `bunker.html?id=${leccionData.siguienteId}`; return; }
                const edad = document.getElementById("p-edad").value;
                const ocup = document.getElementById("p-ocupacion").value;
                const tel = phoneInput ? phoneInput.getNumber() : document.getElementById("p-telefono").value;
                if(!edad || !ocup || !tel) return alert("Datos incompletos.");
                userRef.set({ edad: edad, ocupacion: ocup, telefono: tel, leccion_actual_DF: leccionData.siguienteId }, { merge: true })
                .then(() => { window.location.href = `bunker.html?id=${leccionData.siguienteId}`; });
            };

        } else if (leccionData.tipo === "candado") {
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            workArea.innerHTML = `
                <div class="work-area">
                    <img src="img/candado.webp" class="relic-image-lock">
                    <p class="text-base text-center w-full">Liberación en:</p>
                    <div id="countdown" class="stats-container mt-m">
                        <div class="stat-box"><span id="hrs" class="stat-value">00</span><span class="stat-label">Hrs</span></div>
                        <div class="stat-box"><span id="min" class="stat-value">00</span><span class="stat-label">Min</span></div>
                        <div class="stat-box"><span id="seg" class="stat-value">00</span><span class="stat-label">Seg</span></div>
                    </div>
                </div>`;
            btnMando.style.display = "block"; btnMando.innerText = "Actualizar Protocolo →";
            btnMando.onclick = () => window.location.reload(true);
            const release = new Date(leccionData.fechaLiberacion).getTime();
            countdownInterval = setInterval(() => {
                const dist = release - new Date().getTime();
                if (dist < 0) { 
                    clearInterval(countdownInterval); btnMando.innerText = "Ingresar →"; 
                    btnMando.onclick = () => { 
                        stopAllAudio(); 
                        userRef.set({ leccion_actual_DF: leccionData.siguienteId }, { merge: true }).then(() => { window.location.href = `bunker.html?id=${leccionData.siguienteId}`; }); 
                    };
                } else {
                    document.getElementById("hrs").innerText = Math.floor(dist / 3600000).toString().padStart(2,"0");
                    document.getElementById("min").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2,"0");
                    document.getElementById("seg").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2,"0");
                }
            }, 1000);

        } else if (leccionData.tipo === "reporte") {
            renderReportCard(data, leccionData, workArea, uiLogo, uiIndicator, uiProgress, uiTitle, uiDesc);

        } else if (leccionData.tipo === "principio") {
            // 1. Apagamos TODOS los elementos globales externos para que no estorben
            [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
            
            // 2. Quitamos el margen superior para que el hacha quede en el centro absoluto
            workArea.style.marginTop = "0px";
            
            // 3. Preparamos los botones internos replicando tu HTML suelto
            let botonesInternosHTML = "";
            if (data.estado === "Finalizado_DF") {
                botonesInternosHTML = `
                    <button id="btn-p-upsell" class="btn-mando btn-status-alert" style="display:block;">
                        AVANZAR AL TRAMO 02 →
                    </button>
                    <button id="btn-p-hub" class="btn-ghost" style="display:block;">
                        ← Volver al Hub del Descenso
                    </button>
                `;
            } else {
                botonesInternosHTML = `
                    <button id="btn-p-continuar" class="btn-mando" style="display:block; margin-top: var(--gap-l);">
                        ${leccionData.btnTexto || "Asimilado →"}
                    </button>
                `;
            }

            // 4. Inyectamos la estructura EXACTA de tu HTML funcional
            workArea.innerHTML = `
                <div id="pantalla-reliquia" class="interruption-screen">
                    <img src="${leccionData.imgReliquia}" class="relic-image">
                    <p class="indicator" style="margin-top: var(--gap-m); text-align: center;">${leccionData.textoToque || 'Toca para desenterrar'}</p>
                </div>
                
                <div class="revelation-screen">
                    <div class="logo"><img src="DF.png" onerror="this.src='img/DF.png'"></div>
                    <p class="indicator">${leccionData.indicador}</p>
                    
                    <div class="work-area card mt-l">
                        <span class="principle-statement">${leccionData.principio}</span>
                        <p class="text-base mt-s">${leccionData.contenido}</p>
                    </div>
                    
                    ${botonesInternosHTML}
                </div>
            `;
            
            // 5. La magia del clic (tu lógica original)
            document.getElementById("pantalla-reliquia").onclick = () => { 
                document.body.classList.add('revealed'); 
            };
            
            // 6. Asignamos las acciones a los botones recién inyectados
            if (data.estado === "Finalizado_DF") {
                document.getElementById("btn-p-upsell").onclick = () => { stopAllAudio(); window.location.href = upsellLink; };
                document.getElementById("btn-p-hub").onclick = () => { stopAllAudio(); window.location.href = hubLink; };
            } else {
                document.getElementById("btn-p-continuar").onclick = () => { 
                    stopAllAudio(); 
                    userRef.set({ leccion_actual_DF: leccionData.siguienteId }, { merge: true }).then(() => { window.location.href = `bunker.html?id=${leccionData.siguienteId}`; }); 
                };
            }

        } else if (leccionData.tipo === "hub") {
            uiIndicator.innerText = leccionData.indicador; uiProgress.style.width = leccionData.progreso;
            uiTitle.innerHTML = leccionData.titulo; uiDesc.innerHTML = leccionData.descripcion || "";
            
            let hubHTML = leccionData.lecciones.map(l => `
                <button class="option-btn" onclick="stopAllAudio(); firebase.firestore().collection('usuarios').doc('${user.uid}').set({ leccion_actual_DF: '${l.id}' }, { merge: true }).then(() => { window.location.href='bunker.html?id=${l.id}' });">
                    <span class="indicator">${l.tag}</span><br>
                    <span class="text-base"><b>${l.titulo} &rarr;</b></span>
                </button>`).join("");
            
            workArea.innerHTML = `<div class="work-area">${hubHTML}</div>`;
            
            btnMando.style.display = "block"; 
            if (data.estado === "Finalizado_DF") {
                btnMando.className = "btn-mando btn-status-alert";
                btnMando.innerText = "AVANZAR AL TRAMO 02 →";
                btnMando.onclick = () => { stopAllAudio(); window.location.href = upsellLink; };
            } else {
                // Normalizado: Se fuerza mt-l para botón único.
                btnMando.className = "btn-ghost mt-l"; 
                btnMando.innerText = "Volver al flujo →";
                btnMando.onclick = () => { stopAllAudio(); userRef.set({ leccion_actual_DF: leccionData.siguienteId }, { merge: true }).then(() => { window.location.href = `bunker.html?id=${leccionData.siguienteId}`; }); };
            }

        } else {
            // TARJETAS ESTÁNDAR
            uiIndicator.innerText = leccionData.indicador; uiProgress.style.width = leccionData.progreso;
            uiTitle.innerHTML = leccionData.titulo; uiDesc.innerHTML = leccionData.descripcion || "";
            
            if (leccionData.tipo === "texto") {
                let audioHTML = "";
                if (leccionData.audio) {
                    audioHTML = `<div id="capsule-${leccionId}" class="audio-capsule" onclick="window.activateAudio('${leccionId}')"><audio id="audio-player" src="${leccionData.audio}"></audio><span>Escuchar lección</span><div class="capsule-controls"><button class="capsule-btn" onclick="event.stopPropagation(); document.getElementById('audio-player').currentTime -= 15"> -15 </button><button class="capsule-btn capsule-btn-main" onclick="event.stopPropagation(); window.togglePlay();"><svg id="play-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button><button class="capsule-btn" onclick="event.stopPropagation(); document.getElementById('audio-player').currentTime += 15"> +15 </button></div></div>`;
                }
                workArea.innerHTML = `${audioHTML} <div class="work-area card">${leccionData.contenido}</div>`;
            } else if (leccionData.tipo === "imagen") {
                workArea.innerHTML = `<img src="${leccionData.url}" class="evidence-image">`;
            } else if (leccionData.tipo === "video") {
                workArea.innerHTML = `<div class="video-container"><iframe src="${leccionData.url}" allowfullscreen></iframe></div>${leccionData.postTexto ? `<div class="work-area card mt-m"><p class="text-base">${leccionData.postTexto}</p></div>` : ""}`;
            } else if (leccionData.tipo === "carrusel") {
                workArea.innerHTML = `<div class="carousel-container">${leccionData.items.map(item => `<div class="carousel-item">${item.img ? `<img src="${item.img}" class="evidence-image">` : ""}<p class="text-base mt-s">${item.texto}</p></div>`).join("")}</div>`;
            } else if (leccionData.tipo === "bitacora") {
                workArea.innerHTML = `<div class="work-area card"><textarea id="input-dinamico" placeholder="${leccionData.placeholder}"></textarea></div>`;
                if(data[`bitacora_${leccionId}`]) { const i=document.getElementById("input-dinamico"); i.value=data[`bitacora_${leccionId}`]; i.readOnly=true; i.classList.add("locked"); isLocked=true; }
            } else if (leccionData.tipo === "quiz") {
                workArea.innerHTML = `<div class="work-area">${leccionData.opciones.map(op => `<button class="option-btn">${op}</button>`).join("")}</div>`;
                if(data[`quiz_${leccionId}`]) { 
                    document.querySelectorAll(".option-btn").forEach(b => { if(data[`quiz_${leccionId}`].includes(b.innerText.trim())) b.classList.add("selected"); b.classList.add("locked"); });
                    isLocked = true; 
                } else { document.querySelectorAll(".option-btn").forEach(b => b.onclick = () => toggleOption(b)); }
            }

            // --- LÓGICA DE MODO REPASO EN TARJETAS ESTÁNDAR ---
            if (data.estado === "Finalizado_DF") {
                btnMando.style.display = "none";
                const reviewButtons = document.createElement('div');
                reviewButtons.className = "work-area mt-l";
                reviewButtons.innerHTML = `
                    <button id="btn-upsell-review" class="btn-mando btn-status-alert">
                        AVANZAR AL TRAMO 02 →
                    </button>
                    <button id="btn-back-hub-review" class="btn-ghost">
                        ← Volver al Hub del Descenso
                    </button>
                `;
                workArea.appendChild(reviewButtons);

                document.getElementById("btn-upsell-review").onclick = () => { stopAllAudio(); window.location.href = upsellLink; };
                document.getElementById("btn-back-hub-review").onclick = () => { stopAllAudio(); window.location.href = hubLink; };
            } else {
                btnMando.style.display = "block";
                btnMando.innerText = isLocked ? "REGISTRO SELLADO ✓" : (leccionData.btnTexto || "Continuar →");
                btnMando.onclick = () => {
                    stopAllAudio();
                    let urlSig = `bunker.html?id=${leccionData.siguienteId}`;
                    if (isLocked || ["texto", "video", "imagen", "carrusel"].includes(leccionData.tipo)) {
                        if (nA === nG) { userRef.set({ leccion_actual_DF: leccionData.siguienteId }, { merge: true }).then(() => { window.location.href = urlSig; }); }
                        else { window.location.href = urlSig; } return;
                    }
                    const txt = document.getElementById("input-dinamico") ? document.getElementById("input-dinamico").value : "";
                    const sel = Array.from(document.querySelectorAll(".option-btn.selected")).map(b => b.innerText.trim());
                    if(leccionData.tipo === "bitacora" && !txt.trim()) return alert("Completa tu registro.");
                    if(leccionData.tipo === "quiz" && !sel.length) return alert("Toma una decisión.");
                    
                    userRef.set({ [leccionData.tipo === "bitacora" ? `bitacora_${leccionId}` : `quiz_${leccionId}`]: leccionData.tipo === "bitacora" ? txt : sel, leccion_actual_DF: leccionData.siguienteId }, { merge: true }).then(() => { window.location.href = urlSig; });
                };
            }
        }

        if (data.estado !== "Finalizado_DF" && nA > nG && !["perfil", "candado", "reporte", "hub"].includes(leccionData.tipo)) {
            userRef.set({ leccion_actual_DF: leccionId }, { merge: true });
        }
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("bunker-content").style.display = "flex";
    }).catch(err => { console.error("Error Firestore:", err); document.getElementById("loading-screen").style.display = "none"; });
});

// FUNCIÓN AUXILIAR REPORTE (Normalizado: el reporte limpia la cabecera por completo para su diseño único)
function renderReportCard(data, leccionData, workArea, uiLogo, uiIndicator, uiProgress, uiTitle, uiDesc) {
    const userRef = db.collection("usuarios").doc(auth.currentUser.uid);
    userRef.set({ leccion_actual_DF: leccionId, estado: "Finalizado_DF" }, { merge: true });
    
    [uiLogo, uiIndicator, uiProgress.parentElement, uiTitle, uiDesc].forEach(el => el && (el.style.display = "none"));
    
    const nombreUsr = data.nombre ? data.nombre.toUpperCase() : "EXPEDICIONARIO";

    // Normalizado: Eliminados tokens de margen de botones, la cascada inteligente los asume.
    workArea.innerHTML = `
        <div class="work-area">
            <div class="logo"><img src="DF.png" onerror="this.src='img/DF.png'"></div>
            <span class="nombre-exp">EXPEDICIONARIO: ${nombreUsr}</span>
            <div class="status-badge">ESTATUS: MÁSCARA ROTA</div>
            <h1 class="title mt-s">Fin del Descenso.</h1>
            <p class="description mt-s">Análisis final del Tramo 01 completado.</p>
            
            <div class="work-area card mt-l">
                <p class="text-base"><b>Diagnóstico:</b> Tu capacidad para mentirte ha sido neutralizada. La máscara ha sido fracturada.<br><br><b>Orden:</b> Iniciar la Inmersión (Tramo 02) de inmediato para evitar el colapso operativo.</p>
            </div>
            
            <p class="text-base mt-m"><b>La escotilla de acceso cierra en:</b></p>
            
            <div id="countdown-upsell" class="stats-container">
                <div class="stat-box"><span class="stat-value" id="u-hrs">00</span><span class="stat-label">Horas</span></div>
                <div class="stat-box"><span class="stat-value" id="u-min">00</span><span class="stat-label">Minutos</span></div>
                <div class="stat-box"><span class="stat-value" id="u-seg">00</span><span class="stat-label">Segundos</span></div>
            </div>
            
            <button id="btn-upsell" class="btn-mando btn-status-alert">AVANZAR AL TRAMO 02 →</button>
            <button id="btn-repasar" class="btn-ghost">← Volver al Hub del Descenso</button>
        </div>`;

    document.getElementById("btn-upsell").onclick = () => { stopAllAudio(); window.location.href = leccionData.linkUpsell || "#"; };
    document.getElementById("btn-repasar").onclick = () => { stopAllAudio(); window.location.href = `bunker.html?id=${leccionData.hubId || 1}`; };

    if (leccionData.fechaExpiracion) {
        const targetDate = new Date(leccionData.fechaExpiracion).getTime();
        countdownInterval = setInterval(() => {
            const now = new Date().getTime(); const distance = targetDate - now;
            if (distance < 0) { 
                clearInterval(countdownInterval);
                document.getElementById("countdown-upsell").innerHTML = "<div class='status-badge' style='width:100%; text-align:center; padding: 20px; font-size:16px;'>TIEMPO EXPIRADO</div>"; 
                return; 
            }
            document.getElementById("u-hrs").innerText = Math.floor(distance / (1000 * 60 * 60)).toString().padStart(2, '0');
            document.getElementById("u-min").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            document.getElementById("u-seg").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
        }, 1000);
    } else {
        document.getElementById("countdown-upsell").style.display = "none";
    }
}
