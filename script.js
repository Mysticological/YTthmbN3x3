// DOM Elements
const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");

// Helper: Extract YouTube video ID
function getYouTubeID(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {
    return null;
  }
  return null;
}

// Load thumbnails on Preview click
function updatePreview() {
  let allFilled = true;

  inputs.forEach((input, i) => {
    const videoId = getYouTubeID(input.value.trim());
    if (!videoId) {
      images[i].src = "";
      allFilled = false;
      return;
    }
    images[i].src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  });

  downloadBtn.disabled = !allFilled;
}

if (previewBtn) {
  previewBtn.addEventListener("click", updatePreview);
}

// Download collage
downloadBtn.addEventListener("click", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const size = 150;
  canvas.width = size * 3;
  canvas.height = size * 3;

  progressBar.classList.remove("hidden");
  progressBar.value = 0;

  let loadedCount = 0;
  const total = images.length;

  // Ensure all images are loaded
  const loadPromises = Array.from(images).map(img => {
    return new Promise(resolve => {
      if (img.complete && img.naturalWidth !== 0) {
        loadedCount++;
        progressBar.value = (loadedCount / total) * 100;
        resolve();
      } else {
        img.onload = () => {
          loadedCount++;
          progressBar.value = (loadedCount / total) * 100;
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          progressBar.value = (loadedCount / total) * 100;
          resolve();
        };
      }
    });
  });

  Promise.all(loadPromises).then(() => {
    // Draw 3x3 collage
    images.forEach((img, index) => {
      const x = (index % 3) * size;
      const y = Math.floor(index / 3) * size;
      ctx.drawImage(img, x, y, size, size);
    });

    // Trigger download
    const link = document.createElement("a");
    link.download = "youtube-collage.png"; // PNG
    link.href = canvas.toDataURL("image/png");
    link.click();

    progressBar.classList.add("hidden");
  });
});

// Drag & reorder thumbnails
let draggedIndex = null;

document.querySelectorAll(".cell").forEach((cell, index) => {
  cell.addEventListener("dragstart", () => {
    draggedIndex = index;
    cell.classList.add("dragging");
  });

  cell.addEventListener("dragend", () => {
    cell.classList.remove("dragging");
  });

  cell.addEventListener("dragover", e => e.preventDefault());

  cell.addEventListener("drop", () => {
    if (draggedIndex === null || draggedIndex === index) return;
    swapImages(draggedIndex, index);
    swapInputs(draggedIndex, index);
    draggedIndex = null;
  });
});

function swapImages(a, b) {
  const tempSrc = images[a].src;
  images[a].src = images[b].src;
  images[b].src = tempSrc;
}

function swapInputs(a, b) {
  const tempVal = inputs[a].value;
  inputs[a].value = inputs[b].value;
  inputs[b].value = tempVal;
}
