const DEEPFALL_DATA = {
    // 1. TIPO: TEXTO (Apertura y narrativa)
    "1": {
        "tipo": "texto",
        "indicador": "01 / Narrativa",
        "progreso": "10%",
        "titulo": "Recap de victorias.",
        "descripcion": "Ayer allanamos el terreno, hoy toca construir.",
        "contenido": `<p class="text-base">El día de ayer logramos tres hitos importantes: descubriste la <b>máscara</b>, conociste los criterios para dejar de ser un <b>hombre de superficie</b> y realizaste tu primer <b>acto de renuncia</b>.</p>`,
        "btnTexto": "Siguiente →",
        "siguienteId": "2"
    },

    // 2. TIPO: IMAGEN (Evidencia visual fija)
    "2": {
        "tipo": "imagen",
        "indicador": "02 / Evidencia",
        "progreso": "20%",
        "titulo": "El Escenario.",
        "descripcion": "Las coordenadas exactas de la interacción.",
        "url": "escenario.jpg", 
        "btnTexto": "Analizar entorno →",
        "siguienteId": "3"
    },

    // 3. TIPO: CARRUSEL (Conceptos dinámicos)
    "3": {
        "tipo": "carrusel",
        "indicador": "03 / Pilares",
        "progreso": "30%",
        "titulo": "Los 3 Pilares del Fondo",
        "descripcion": "Desliza para entender la estructura de tu nueva identidad.",
        "items": [
            { "texto": "<b>Presencia:</b> No es estar, es habitar el momento.", "img": "pilar1.png" },
            { "texto": "<b>Densidad:</b> El peso de tu verdad interna.", "img": "pilar2.png" },
            { "texto": "<b>Osadía:</b> La capacidad de actuar con miedo.", "img": "pilar3.png" }
        ],
        "btnTexto": "Entendido →",
        "siguienteId": "4"
    },

    // 4. TIPO: QUIZ (Toma de decisiones)
    "4": {
        "tipo": "quiz",
        "indicador": "04 / Decisión",
        "progreso": "40%",
        "titulo": "La prueba de fuego.",
        "descripcion": "¿Cómo crees que reacciona un hombre de fondo?",
        "opciones": ["Contuve el impulso.", "Me sentí mal.", "Actué siguiendo el impulso."],
        "btnTexto": "Ver resultado →",
        "siguienteId": "5"
    },

    // 5. TIPO: VIDEO (Reproductor Bunny.net)
    "5": {
        "tipo": "video",
        "indicador": "05 / Acción",
        "progreso": "50%",
        "titulo": "Evidencia: Desde dónde.",
        "descripcion": "Observa el lenguaje, la tensión y la resolución.",
        "url": "https://player.mediadelivery.net/embed/649829/1d9c53ab-54e0-4abc-8b7e-5538c44fdc03", 
        "postTexto": "<b>No importa lo que dices, sino desde dónde lo dices.</b>",
        "btnTexto": "Extraer lección →",
        "siguienteId": "6"
    },

    // 6. TIPO: BITÁCORA (Captura de reflexión)
    "6": {
        "tipo": "bitacora",
        "indicador": "06 / Reflexión",
        "progreso": "60%",
        "titulo": "¿Qué cualidades valoras?",
        "descripcion": "Sin el mundo de la forma ¿qué la hace atractiva?",
        "placeholder": "Escribe las cualidades internas aquí...",
        "btnTexto": "Sellar respuesta →",
        "siguienteId": "7"
    },

    // 7. TIPO: PRINCIPIO (Ritual de revelación mística)
    "7": {
        "tipo": "principio",
        "imgReliquia": "hacha.png",
        "textoToque": "Toca para desenterrar el Principio",
        "indicador": "07 / Revelación",
        "principio": "\"Afilamos el hacha aunque no vayamos a cortar ningún árbol.\"",
        "contenido": "El entrenamiento es el estado natural del hombre profundo.",
        "btnTexto": "Asimilado →",
        "siguienteId": "8"
    },

    // 8. TIPO: HUB (Navegación por el día)
    "8": {
        "tipo": "hub",
        "indicador": "08 / Mapa",
        "progreso": "80%",
        "titulo": "Centro de Control",
        "descripcion": "Repasa los hitos o avanza al cierre.",
        "lecciones": [
            { "id": "1", "tag": "INTRO", "titulo": "Apertura" },
            { "id": "4", "tag": "QUIZ", "titulo": "Decisión" },
            { "id": "5", "tag": "VIDEO", "titulo": "Evidencia" },
            { "id": "7", "tag": "RITUAL", "titulo": "Principio" }
        ],
        "btnTexto": "Ir al final →",
        "siguienteId": "9"
    },

    // 9. TIPO: CANDADO (Bloqueo temporal)
    "9": {
        "tipo": "candado",
        "fechaLiberacion": "May 10, 2026 12:00:00",
        "siguienteId": "10"
    },

    // 10. TIPO: REPORTE (Cierre y Upsell)
    "10": {
        "tipo": "reporte",
        "fechaExpiracion": "May 15, 2026 19:00:00",
        "linkUpsell": "https://deepmersion.deepnessmen.com"
    }
};
