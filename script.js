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

// Preview thumbnails
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

previewBtn.addEventListener("click", updatePreview);

// Download collage (desktop + mobile-safe)
downloadBtn.addEventListener("click", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const size = 150;
  canvas.width = size * 3;
  canvas.height = size * 3;

  progressBar.classList.remove("hidden");
  progressBar.value = 0;

  let loaded = 0;
  const total = images.length;

  const loadPromises = Array.from(images).map(img => {
    return new Promise(resolve => {
      if (img.complete && img.naturalWidth !== 0) {
        loaded++;
        progressBar.value = (loaded / total) * 100;
        resolve();
      } else {
        img.onload = img.onerror = () => {
          loaded++;
          progressBar.value = (loaded / total) * 100;
          resolve();
        };
      }
    });
  });

  Promise.all(loadPromises).then(() => {
    images.forEach((img, i) => {
      const x = (i % 3) * size;
      const y = Math.floor(i / 3) * size;
      ctx.drawImage(img, x, y, size, size);
    });

    const dataUrl = canvas.toDataURL("image/png");

    // Mobile Safari fallback: open image in new tab
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.open(dataUrl, "_blank");
    } else {
      const link = document.createElement("a");
      link.download = "youtube-collage.png";
      link.href = dataUrl;
      link.click();
    }

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
    swap(images, draggedIndex, index, "src");
    swap(inputs, draggedIndex, index, "value");
    draggedIndex = null;
  });
});

function swap(arr, a, b, prop) {
  const temp = arr[a][prop];
  arr[a][prop] = arr[b][prop];
  arr[b][prop] = temp;
}
