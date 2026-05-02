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

        // Si hay error en datos.js, esto detiene el congelamiento y avisa
        if (typeof DEEPFALL_DATA === "undefined") {
            alert("🔥 ERROR CRÍTICO: Tu archivo datos.js tiene un error de sintaxis (falta una coma o llave). Revisa el código.");
            document.getElementById("loading-screen").style.display = "none";
            return;
        }

        const leccionData = DEEPFALL_DATA[leccionId];
        if(!leccionData) { alert("Lección no encontrada."); return; }

        const workArea = document.getElementById("dynamic-work-area");
        const btnMando = document.getElementById("btn-mando");
        const uiLogo = document.getElementById("ui-logo");
        btnMando.className = "btn-mando"; 
        
        if(countdownInterval) clearInterval(countdownInterval);

        let isLocked = false;

        if (leccionData.tipo === "candado") {
            uiLogo.style.display = "none";
            document.getElementById("ui-indicator").style.display = "none";
            document.getElementById("ui-progress").parentElement.style.display = "none";
            document.getElementById("ui-title").style.display = "none";
            document.getElementById("ui-desc").style.display = "none";

            workArea.className = "work-area";
            workArea.innerHTML = `
                <img src="candado.webp" class="relic-lock-img" alt="Protocolo Bloqueado">
                <p class="text-base" id="status-text">La siguiente ruta será liberada en:</p>
                <div id="countdown" class="stats-container">
                    <div class="stat-box"><span class="stat-value" id="hrs">00</span><span class="stat-label">Horas</span></div>
                    <div class="stat-box"><span class="stat-value" id="min">00</span><span class="stat-label">Minutos</span></div>
                    <div class="stat-box"><span class="stat-value" id="seg">00</span><span class="stat-label">Segundos</span></div>
                </div>
            `;
            btnMando.innerText = "Actualizar Protocolo →";
            btnMando.onclick = () => window.location.reload(true);
            btnMando.style.display = "block";

            const countDownDate = new Date(leccionData.fechaLiberacion).getTime();
            countdownInterval = setInterval(function() {
                const now = new Date().getTime(); const distance = countDownDate - now;
                if (distance < 0) {
                    clearInterval(countdownInterval);
                    document.getElementById("countdown").style.display = "none";
                    document.getElementById("status-text").innerHTML = "<b>La resistencia ha sido neutralizada.</b><br><br>Actualiza el protocolo para acceder a las coordenadas.";
                    btnMando.classList.add("btn-ready");
                    btnMando.innerText = "Ingresar al siguiente tramo →";
                    btnMando.onclick = () => window.location.href = `bunker.html?id=${leccionData.siguienteId}`;
                } else {
                    const h = Math.floor(distance / (1000 * 60 * 60));
                    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((distance % (1000 * 60)) / 1000);
                    document.getElementById("hrs").innerText = h.toString().padStart(2, "0");
                    document.getElementById("min").innerText = m.toString().padStart(2, "0");
                    document.getElementById("seg").innerText = s.toString().padStart(2, "0");
                }
            }, 1000);

        } else if (leccionData.tipo === "reporte") {
            if (data.access_DM === true || data.access_DQ === true) {
                if (data.access_DQ) window.location.href = data.leccion_actual_DQ || "01_DQ_texto.html";
                else if (data.estado === "Finalizado_DM") window.location.href = "08_DM_reportefinal.html"; 
                else window.location.href = data.leccion_actual_DM || "01_DM_texto.html";
                return; 
            }

            userRef.update({ leccion_actual_DF: "bunker.html?id=63", estado: "Finalizado_DF" });

            document.getElementById("ui-indicator").style.display = "none";
            document.getElementById("ui-progress").parentElement.style.display = "none";
            document.getElementById("ui-title").style.display = "none";
            document.getElementById("ui-desc").style.display = "none";
            
            const nombreExp = data.nombre ? data.nombre.toUpperCase() : "SIN NOMBRE";

            workArea.className = "work-area";
            workArea.innerHTML = `
                <span id="nombre-exp" style="font-size: 11px; font-weight: 600; color: #878787; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 18px; line-height: 1; display: block;">
                    EXPEDICIONARIO: ${nombreExp}
                </span>
                <div class="status-badge" style="background-color: #fce8e6; color: #d93025; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: 800; display: inline-block; margin-bottom: 25px; border: 1px solid #d93025; text-transform: uppercase;">
                    ESTATUS: MÁSCARA ROTA
                </div>
                <h1 class="title" style="margin-bottom:10px;">Fin del Descenso.</h1>
                <p class="description" style="margin-bottom:25px;">Análisis final del Tramo 01 completado.</p>
                <div class="card" style="text-align:left; padding:20px; background:#f9f9f9; border-radius:16px;">
                    <p class="text-base" style="margin:0;">
                        <b>Diagnóstico:</b> Tu capacidad para mentirte ha sido neutralizada. La máscara ha sido fracturada.<br><br>
                        <b>Orden:</b> Iniciar la Inmersión (Tramo 02) de inmediato para evitar el colapso operativo.
                    </p>
                </div>
                <p class="text-base" style="margin-top: 35px; margin-bottom: -20px; width:100%; text-align:center;"><b>La escotilla de acceso cierra en:</b></p>
                <div id="countdown" class="stats-container" style="display:flex;">
                    <div class="stat-box"><span class="stat-value" id="hrs">00</span><span class="stat-label">Horas</span></div>
                    <div class="stat-box"><span class="stat-value" id="min">00</span><span class="stat-label">Minutos</span></div>
                    <div class="stat-box"><span class="stat-value" id="seg">00</span><span class="stat-label">Segundos</span></div>
                </div>
            `;

            btnMando.style.display = "none"; 
            const btnUpsell = document.getElementById("btn-alerta-reporte");
            document.getElementById("btn-volver-hub").style.display = "none";

            btnUpsell.innerText = "AVANZAR AL TRAMO 02 →";
            btnUpsell.onclick = () => window.location.href = leccionData.linkUpsell;
            btnUpsell.style.display = "block";

            const targetDate = new Date(leccionData.fechaExpiracion).getTime();
            countdownInterval = setInterval(function() {
                const now = new Date().getTime(); const distance = targetDate - now;
                if (distance < 0) { 
                    clearInterval(countdownInterval);
                    document.getElementById("countdown").innerHTML = "<p style='width:100%;text-align:center;font-weight:800;color:#d93025;'>EXPIRADO</p>"; 
                    return; 
                }
                const h = Math.floor(distance / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);
                document.getElementById("hrs").innerText = h.toString().padStart(2, "0");
                document.getElementById("min").innerText = m.toString().padStart(2, "0");
                document.getElementById("seg").innerText = s.toString().padStart(2, "0");
            }, 1000);

        } else {
            uiLogo.style.display = "block";
            document.getElementById("ui-indicator").style.display = "block";
            document.getElementById("ui-progress").parentElement.style.display = "block";
            document.getElementById("ui-title").style.display = "block";
            document.getElementById("ui-desc").style.display = "block";

            document.getElementById("ui-indicator").innerText = leccionData.indicador;
            document.getElementById("ui-progress").style.width = leccionData.progreso;
            document.getElementById("ui-title").innerHTML = leccionData.titulo;
            document.getElementById("ui-desc").innerHTML = leccionData.descripcion || "";
            btnMando.innerText = leccionData.btnTexto || "Continuar →";

            if (leccionData.tipo === "texto") {
                workArea.className = "work-area card";
                workArea.innerHTML = leccionData.contenido;
            } 
            else if (leccionData.tipo === "video") {
                workArea.className = "work-area";
                workArea.innerHTML = `<div class="video-container">
                    <iframe src="${leccionData.url}" loading="lazy" style="border:0; position:absolute; top:0; left:0; height:100%; width:100%; border-radius:16px;" allow="autoplay; fullscreen"></iframe>
                </div>
                ${leccionData.postTexto ? `<div class="post-video-box"><p>${leccionData.postTexto}</p></div>` : ""}`;
            }
            else if (leccionData.tipo === "bitacora") {
                workArea.className = "work-area card";
                workArea.innerHTML = `<textarea id="input-dinamico" placeholder="${leccionData.placeholder}"></textarea>`;
                const campoDB = `bitacora_${leccionId}`;
                if (data[campoDB]) {
                    document.getElementById("input-dinamico").value = data[campoDB];
                    document.getElementById("input-dinamico").readOnly = true;
                    document.getElementById("input-dinamico").classList.add("locked");
                    isLocked = true;
                }
            }
            else if (leccionData.tipo === "quiz") {
                workArea.className = "work-area";
                let opcionesHTML = leccionData.opciones.map(op => `<button class="option-btn" onclick="toggleOption(this)">${op}</button>`).join("");
                workArea.innerHTML = opcionesHTML;
                const campoDB = `quiz_${leccionId}`;
                if (data[campoDB] && Array.isArray(data[campoDB])) {
                    workArea.classList.add("quiz-locked");
                    document.querySelectorAll(".option-btn").forEach(btn => {
                        if(data[campoDB].includes(btn.innerText.trim())) btn.classList.add("selected");
                    });
                    isLocked = true;
                    btnMando.classList.add("btn-disabled");
                    btnMando.innerText = "REGISTRO SELLADO ✓";
                }
            }

            btnMando.onclick = () => {
                let urlSiguiente = leccionData.siguienteId.includes(".html") ? leccionData.siguienteId : `bunker.html?id=${leccionData.siguienteId}`;
                
                if (isLocked || leccionData.tipo === "texto" || leccionData.tipo === "video") {
                    window.location.href = urlSiguiente;
                    return;
                }

                if (leccionData.tipo === "bitacora") {
                    const txt = document.getElementById("input-dinamico").value;
                    if(txt.trim() === "") { alert("El búnker exige tu respuesta."); return; }
                    btnMando.innerText = "Sincronizando..."; btnMando.disabled = true;
                    userRef.update({ [`bitacora_${leccionId}`]: txt, leccion_actual_DF: urlSiguiente })
                           .then(() => window.location.href = urlSiguiente);
                }
                else if (leccionData.tipo === "quiz") {
                    const seleccionados = Array.from(document.querySelectorAll(".option-btn.selected")).map(b => b.innerText.trim());
                    if(seleccionados.length === 0) { alert("Toma una decisión."); return; }
                    btnMando.innerText = "Sincronizando..."; btnMando.disabled = true;
                    userRef.update({ [`quiz_${leccionId}`]: seleccionados, leccion_actual_DF: urlSiguiente })
                           .then(() => window.location.href = urlSiguiente);
                }
            };
            
            const btnRojo = document.getElementById("btn-alerta-reporte");
            btnRojo.onclick = () => { window.location.href = "bunker.html?id=63"; }; 
            document.getElementById("btn-volver-hub").style.display = "none";

            if (data.estado === "Finalizado_DF" && !data.access_DM) {
                btnMando.style.display = isLocked ? "none" : "block";
                btnRojo.style.display = "block";
            } else if (data.access_DM === true || data.estado === "Finalizado_DM" || data.access_DQ === true) {
                btnMando.style.display = "block";
                btnRojo.style.display = "none";
                if(isLocked) { btnMando.innerText = "Continuar →"; btnMando.classList.remove("btn-disabled"); }
            } else {
                btnMando.style.display = "block";
                btnRojo.style.display = "none";
            }
        }

        // 🧠 GPS SEGURO: AHORA GUARDA LA RUTA COMPLETA PARA QUE INDEX.HTML NO FALLE
        const numActual = parseInt(leccionId) || 0;
        let numGuardado = 0;
        if (data.leccion_actual_DF) {
            const match = String(data.leccion_actual_DF).match(/\d+/);
            if (match) numGuardado = parseInt(match[0]);
        }

        if (data.estado !== "Finalizado_DF" && !data.access_DM && !data.access_DQ && numActual > 0) {
            if (numActual > numGuardado) {
                userRef.update({ leccion_actual_DF: `bunker.html?id=${leccionId}` });
            }
        }

        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("bunker-content").style.display = "flex";
    });
});
