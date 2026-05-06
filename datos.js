const DEEPFALL_DATA = {
    // 1. TIPO: PERFIL (Identificación obligatoria)
    "DF1": { 
        "tipo": "perfil",
        "tramo": "DF",
        "indicador": "00 / Acceso",
        "progreso": "1%",
        "titulo": "Protocolo de Identidad.",
        "descripcion": "Antes de descender, el búnker requiere tus coordenadas biográficas.",
        "btnTexto": "Registrar Identidad →",
        "siguienteId": "DF2"
    },

    // 2. TIPO: TEXTO (Apertura y narrativa)
    "DF2": {
        "tipo": "texto",
        "tramo": "DF",
        "indicador": "01 / Narrativa",
        "progreso": "10%",
        "titulo": "Recap de victorias.",
        "audio": "reel.mp3",
        "descripcion": "Ayer allanamos el terreno, hoy toca construir.",
        "contenido": `<p class="text-base">El día de ayer logramos tres hitos importantes: descubriste la <b>máscara</b>, conociste los criterios para dejar de ser un <b>hombre de superficie</b> y realizaste tu primer <b>acto de renuncia</b>.</p>`,
        "btnTexto": "Siguiente →",
        "siguienteId": "DF3"
    },

    // 3. TIPO: IMAGEN (Evidencia visual fija)
    "DF3": {
        "tipo": "imagen",
        "tramo": "DF",
        "indicador": "02 / Evidencia",
        "progreso": "20%",
        "titulo": "El Escenario.",
        "descripcion": "Las coordenadas exactas de la interacción.",
        "url": "mariano.webp", 
        "btnTexto": "Analizar entorno →",
        "siguienteId": "DF4"
    },

    // 4. TIPO: CARRUSEL (Conceptos dinámicos)
    "DF4": {
        "tipo": "carrusel", 
        "tramo": "DF",
        "indicador": "03 / Pilares",
        "progreso": "30%",
        "titulo": "Los 3 Pilares del Fondo",
        "descripcion": "Desliza para entender la estructura de tu nueva identidad.",
        "items": [
            { "texto": "<b>Presencia:</b> No es estar, es habitar el momento.", "img": "familia.webp" },
            { "texto": "<b>Densidad:</b> El peso de tu verdad interna.", "img": "salud.webp" },
            { "texto": "<b>Osadía:</b> La capacidad de actuar con miedo.", "img": "perro.webp" }
        ],
        "btnTexto": "Entendido →",
        "siguienteId": "DF5"
    },

    // 5. TIPO: QUIZ (Toma de decisiones)
    "DF5": {
        "tipo": "quiz",
        "tramo": "DF",
        "indicador": "04 / Decisión",
        "progreso": "40%",
        "titulo": "La prueba de fuego.",
        "descripcion": "¿Cómo crees que reacciona un hombre de fondo?",
        "opciones": ["Contuve el impulso.", "Me sentí mal.", "Actué siguiendo el impulso."],
        "btnTexto": "Ver resultado →",
        "siguienteId": "DF6"
    },

    // 6. TIPO: VIDEO (Reproductor Bunny.net)
    "DF6": {
        "tipo": "video",
        "tramo": "DF",
        "indicador": "05 / Acción",
        "progreso": "50%",
        "titulo": "Evidencia: Desde dónde.",
        "descripcion": "Observa el lenguaje, la tensión y la resolución.",
        "url": "https://player.mediadelivery.net/embed/649829/1d9c53ab-54e0-4abc-8b7e-5538c44fdc03", 
        "postTexto": "<b>No importa lo que dices, sino desde dónde lo dices.</b>",
        "btnTexto": "Extraer lección →",
        "siguienteId": "DF7"
    },

    // 7. TIPO: BITÁCORA (Captura de reflexión)
    "DF7": {
        "tipo": "bitacora",
        "tramo": "DF",
        "indicador": "06 / Reflexión",
        "progreso": "60%",
        "titulo": "¿Qué cualidades valoras?",
        "descripcion": "Sin el mundo de la forma ¿qué la hace atractiva?",
        "placeholder": "Escribe las cualidades internas aquí...",
        "btnTexto": "Sellar respuesta →",
        "siguienteId": "DF8"
    },

    // 8. TIPO: PRINCIPIO (Ritual de revelación mística)
    "DF8": {
        "tipo": "principio",
        "tramo": "DF",
        "imgReliquia": "hacha.png",
        "textoToque": "Toca para desenterrar el Principio",
        "indicador": "07 / Revelación",
        "principio": "\"Afilamos el hacha aunque no vayamos a cortar ningún árbol.\"",
        "contenido": "El entrenamiento es el estado natural del hombre profundo.",
        "btnTexto": "Asimilado →",
        "siguienteId": "DF9"
    },

    // 9. TIPO: CANDADO (Bloqueo temporal)
    "DF9": {
        "tipo": "candado",
        "tramo": "DF",
        "fechaLiberacion": "May 5, 2026 13:49:00",
        "siguienteId": "DF10"
    },

    // 10. TIPO: REPORTE (Cierre y Upsell)
    "DF10": {
    "tipo": "reporte",
    "tramo": "DF",
    "linkUpsell": "https://TU_LINK_DE_PAGO_AQUI.com",
    "fechaExpiracion": "May 10, 2026 19:00:00 GMT-0500",
    "hubId": "DF11" 
        
    },

    // 11. TIPO: HUB (Navegación por el día)
    "DF11": {
        "tipo": "hub",
        "tramo": "DF",
        "indicador": "08 / Mapa",
        "progreso": "80%",
        "titulo": "Centro de Control",
        "descripcion": "Repasa los hitos o avanza al cierre.",
        "lecciones": [
            { "id": "2", "tag": "INTRO", "titulo": "Apertura" },
            { "id": "5", "tag": "QUIZ", "titulo": "Decisión" },
            { "id": "6", "tag": "VIDEO", "titulo": "Evidencia" },
            { "id": "8", "tag": "RITUAL", "titulo": "Principio" }
        ],
        "btnTexto": "Ir al final →",
        "siguienteId": "DM1"
    },

    // --- TRAMO 02: DEEPMERSION ---

    "DM1": {
        "tipo": "texto",
        "tramo": "DM",
        "indicador": "00 / INMERSIÓN",
        "progreso": "5%",
        "titulo": "Bienvenido a Deepmersion.",
        "descripcion": "Has cruzado el umbral del Tramo 02.",
        "contenido": "<p class=\"text-base\">Esta es la prueba definitiva de que el Cerebro detectó tu permiso VIP y te trajo al inicio de este nuevo tramo automáticamente.</p>",
        "btnTexto": "Continuar Inmersión →",
        "siguienteId": "DM2"
    }
}; 
