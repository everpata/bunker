<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Hub DF / Deepfall</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* 🚨 AJUSTES ESTRUCTURALES V4.0 */
        .hub-grid { 
            width: 100%; display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 0 !important; 
        }
        
        .lesson-card { 
            background: #f5f5f7; border: 1px solid #e0e0e0; border-radius: 16px; 
            padding: 22px; display: flex; align-items: center; justify-content: space-between; 
            text-decoration: none; color: #333; transition: all 0.3s; 
        }
        .lesson-card:hover { border-color: #333; background: #fff; transform: translateY(-2px); }
        .lesson-info b { display: block; font-size: 15px; margin-bottom: 4px; color: #333; }
        .lesson-info span { font-size: 12px; color: #878787; font-weight: 500; }

        #loading-screen { 
            display: flex; align-items: center; justify-content: center; 
            height: 100vh; width: 100vw; background: #fff; 
            position: fixed; top: 0; left: 0; z-index: 9999; 
        }
    </style>
</head>
<body>

    <div id="loading-screen">
        <img src="DF.png" class="loading-logo" alt="Cargando...">
    </div>

    <div class="container" id="bunker-content" style="display: none;">
        <div class="logo"><img src="DF.png"></div>
        <p class="indicator">Centro de Mando / Tramo 01</p>
        <h1 class="title">Descenso.</h1>
        <p class="description">Protocolos fundamentales de la superficie.</p>

        <div class="hub-grid">
            <a href="01_DF_texto.html" class="lesson-card">
                <div class="lesson-info"><b>01. La Paradoja</b><span>Descenso base</span></div>
                <span style="color: #ccc;">→</span>
            </a>
            <a href="02_DF_bitacora.html" class="lesson-card">
                <div class="lesson-info"><b>02. Análisis</b><span>Bitácora operativa</span></div>
                <span style="color: #ccc;">→</span>
            </a>
            <a href="03_DF_quiz.html" class="lesson-card">
                <div class="lesson-info"><b>03. Sincronización</b><span>Evaluación inicial</span></div>
                <span style="color: #ccc;">→</span>
            </a>
            <a href="04_DF_imagen.html" class="lesson-card">
                <div class="lesson-info"><b>04. Resultados</b><span>Evidencia teórica</span></div>
                <span style="color: #ccc;">→</span>
            </a>
            <a href="05_DF_video.html" class="lesson-card">
                <div class="lesson-info"><b>05. Análisis Visual</b><span>Patrones de ruido</span></div>
                <span style="color: #ccc;">→</span>
            </a>
            <a href="06_DF_principios.html" class="lesson-card">
                <div class="lesson-info"><b>06. Principio III</b><span>Afilando el hacha</span></div>
                <span style="color: #ccc;">→</span>
            </a>
        </div>

        <button id="btn-ir-dm" class="btn-mando">Ir al Hub de la Inmersión (DM) →</button>
        
        <button id="btn-ir-dq" class="btn-mando" style="display: none; background-color: #333 !important;">Ir al Hub de la Cúspide (DQ) →</button>
        
        <button id="btn-logout" class="btn-ghost">Cerrar Centro de Mando</button>
    </div>

    <script src="https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.15.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore-compat.js"></script>
    
    <script>
        const rutaHubDM = "09_DM_hub.html";
        const rutaHubDQ = "09_DQ_hub.html";

        document.getElementById("btn-ir-dm").onclick = () => { window.location.href = rutaHubDM; };
        document.getElementById("btn-ir-dq").onclick = () => { window.location.href = rutaHubDQ; };
        document.getElementById("btn-logout").onclick = () => { 
            firebase.auth().signOut().then(() => { window.location.href = "index.html"; });
        };

        const firebaseConfig = { 
            apiKey: "AIzaSyARmU6NUnRajN8dMB6Pi35WbSC2ZKJd-X8", 
            authDomain: "deepfall-b3601.firebaseapp.com", 
            projectId: "deepfall-b3601", 
            storageBucket: "deepfall-b3601.firebasestorage.app", 
            messagingSenderId: "207043962011", 
            appId: "1:207043962011:web:681397c7d540b4b3d4523e" 
        };
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth(); const db = firebase.firestore();

        auth.onAuthStateChanged((user) => {
            if (user) {
                db.collection("usuarios").doc(user.uid).get().then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        
                        // 🔒 REGLA DE ORO: Solo DM o DQ pueden entrar aquí
                        if (data.access_DM === true || data.access_DQ === true) {
                            document.getElementById("loading-screen").style.display = "none";
                            document.getElementById("bunker-content").style.display = "flex";

                            // Mostrar botón de la Cúspide solo si tiene rango
                            if (data.access_DQ === true) {
                                document.getElementById("btn-ir-dq").style.display = "block";
                            }
                        } else {
                            // Si no tiene acceso a DM, no puede estar en este Hub
                            window.location.href = "08_DF_reportefinal.html"; 
                        }
                    }
                });
            } else { window.location.href = "index.html"; }
        });
    </script>
</body>
</html>
