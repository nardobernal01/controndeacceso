const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const messageOverlay = document.getElementById("message-overlay");
const welcomeMessage = document.getElementById("welcome-message");
const statusMessage = document.getElementById("status-message");

let isProcessing = false;

// 1. Acceder a la cámara del usuario
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false,
    });
    video.srcObject = stream;
  } catch (err) {
    console.error("Error al acceder a la cámara: ", err);
    alert("No se pudo acceder a la cámara. Revisa los permisos.");
  }
}

// Muestra el mensaje de bienvenida
function showMessage(message, status) {
  welcomeMessage.textContent = message;
  statusMessage.textContent = status;
  messageOverlay.classList.remove("hidden");
  messageOverlay.classList.add("visible");

  setTimeout(() => {
    messageOverlay.classList.remove("visible");
    // Usamos 'transitionend' para asegurar que la transición de opacidad termine antes de ocultar
    messageOverlay.addEventListener(
      "transitionend",
      () => {
        messageOverlay.classList.add("hidden");
      },
      { once: true }
    );
    isProcessing = false;
  }, 3000);
}

// 2. Capturar un fotograma y enviarlo para reconocimiento
async function recognizeFace() {
  if (isProcessing || video.paused || video.ended) return;

  context.drawImage(video, 0, 0, 640, 480);

  canvas.toBlob(async (blob) => {
    if (!blob) {
      console.error("No se pudo crear el blob de la imagen.");
      return;
    }
    const formData = new FormData();
    formData.append("photo", blob, "capture.jpg");

    try {
      isProcessing = true;
      const response = await fetch(
        "http://localhost:3001/api/attendance/check-in",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Reconocimiento exitoso:", result);
        showMessage(result.message, result.status);
      } else {
        console.log(
          "Respuesta no exitosa del servidor:",
          result.message || "Sin mensaje"
        );
        // Si no se reconoce, esperamos un poco más antes de reintentar
        setTimeout(() => {
          isProcessing = false;
        }, 2500);
      }
    } catch (error) {
      console.error("Error de red o al procesar la petición:", error);
      // Si hay un error de red (como el 404), se mostrará aquí en la consola
      setTimeout(() => {
        isProcessing = false;
      }, 2500);
    }
  }, "image/jpeg");
}

// Inicia la cámara y el bucle de reconocimiento
setupCamera();
video.addEventListener("loadeddata", () => {
  setInterval(recognizeFace, 2000);
});
