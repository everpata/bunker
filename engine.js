// 1. CONFIGURACIÓN DE FIREBASE (Cámbiala por la tuya si varía)
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

// 2. LECTOR DE RUTAS (Sabe en qué tarjeta está el usuario)
const urlParams = new URLSearchParams(window.location.search);
let leccionId = urlParams.get('id');

// Función auxiliar para los Quizzes
function toggleOption(btn) { btn.classList.toggle('selected'); }

// 3. INICIALIZACIÓN DEL SISTEMA
auth.onAuthStateChanged((user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const userRef = db.collection("usuarios").doc(user.uid);

    userRef.get().then((doc) => {
        if (!doc.exists) { window.location.href = "index.html"; return; }
        const data = doc.data();

        // Si el usuario entra sin ID (ej. solo escribe bunker.html), lo mandamos a su última lección
        if (!leccionId) {
            let guardada = data.leccion_actual_DF ? data.leccion_actual_DF.match(/\d+/)[0] : "13";
            window.location.href = `bunker.html?id=${guardada}`;
            return;
        }

        // Extraemos los datos de la lección del archivo datos.js
        const leccionData = DEEPFALL_DATA[leccionId];
        if(!leccionData) { alert("Lección no encontrada en el servidor."); return; }

        // --- A. RENDERIZADO VISUAL DINÁMICO ---
        document.getElementById("ui-indicator").innerText = leccionData.indicador;
        document.getElementById("ui-progress").style.width = leccionData.progreso;
        document.getElementById("ui-title").innerHTML = leccionData.titulo;
        document.getElementById("ui-desc").innerHTML = leccionData.descripcion || "";

        const workArea = document.getElementById("dynamic-work-area");
        const btnMando = document.getElementById("btn-mando");
        btnMando.innerText = leccionData.btnTexto || "Continuar →";

        let isLocked = false;

        // Inyección según el Tipo de Tarjeta
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
            let opcionesHTML = leccionData.opciones.map(op => `<button class="option-btn" onclick="toggleOption(this)">${op}</button>`).join('');
            workArea.innerHTML = opcionesHTML;
            const campoDB = `quiz_${leccionId}`;
            if (data[campoDB] && Array.isArray(data[campoDB])) {
                workArea.classList.add("quiz-locked");
                document.querySelectorAll('.option-btn').forEach(btn => {
                    if(data[campoDB].includes(btn.innerText.trim())) btn.classList.add('selected');
                });
                isLocked = true;
                btnMando.classList.add("btn-disabled");
                btnMando.innerText = "REGISTRO SELLADO ✓";
            }
        }

        // --- B. BLINDAJE DE NAVEGACIÓN ---
        const btnRojo = document.getElementById("btn-alerta-reporte");
        const btnHub = document.getElementById("btn-volver-hub");

        document.getElementById("btn-alerta-reporte").onclick = () => { window.location.href = "08_DF_reportefinal.html"; };
        document.getElementById("btn-volver-hub").onclick = () => { window.location.href = "09_DF_hub.html"; };

        if (data.estado === "Finalizado_DF" && !data.access_DM) {
            btnMando.style.display = isLocked ? "none" : "block";
            btnRojo.style.display = "block";
            btnHub.style.display = "none";
        } else if (data.access_DM === true || data.estado === "Finalizado_DM" || data.access_DQ === true) {
            btnMando.style.display = "block";
            btnRojo.style.display = "none";
            btnHub.style.display = "block";
            if(isLocked) { btnMando.innerText = "Continuar →"; btnMando.classList.remove("btn-disabled"); }
        } else {
            btnMando.style.display = "block";
            btnRojo.style.display = "none";
            btnHub.style.display = "none";
        }

        // --- C. GPS MATEMÁTICO INTELIGENTE ---
        const numActual = parseInt(leccionId);
        const numGuardado = data.leccion_actual_DF ? parseInt(data.leccion_actual_DF.match(/\d+/)[0]) : 0;

        if (data.estado !== "Finalizado_DF" && !data.access_DM && !data.access_DQ) {
            if (numActual > numGuardado) {
                userRef.update({ leccion_actual_DF: leccionId });
            }
        }

        // --- D. ACCIÓN DEL BOTÓN PRINCIPAL ---
        btnMando.onclick = () => {
            if (isLocked || leccionData.tipo === "texto" || leccionData.tipo === "video") {
                window.location.href = `bunker.html?id=${leccionData.siguienteId}`;
                return;
            }

            if (leccionData.tipo === "bitacora") {
                const txt = document.getElementById("input-dinamico").value;
                if(txt.trim() === "") { alert("El búnker exige tu respuesta."); return; }
                btnMando.innerText = "Sincronizando..."; btnMando.disabled = true;
                userRef.update({ [`bitacora_${leccionId}`]: txt, leccion_actual_DF: leccionData.siguienteId })
                       .then(() => window.location.href = `bunker.html?id=${leccionData.siguienteId}`);
            }
            else if (leccionData.tipo === "quiz") {
                const seleccionados = Array.from(document.querySelectorAll('.option-btn.selected')).map(b => b.innerText.trim());
                if(seleccionados.length === 0) { alert("Toma una decisión."); return; }
                btnMando.innerText = "Sincronizando..."; btnMando.disabled = true;
                userRef.update({ [`quiz_${leccionId}`]: seleccionados, leccion_actual_DF: leccionData.siguienteId })
                       .then(() => window.location.href = `bunker.html?id=${leccionData.siguienteId}`);
            }
        };

        // Fin de carga
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("bunker-content").style.display = "flex";
    });
});
