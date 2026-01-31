const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");
const mobileHint = document.getElementById("mobileHint");

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (isMobile) {
  mobileHint.classList.remove("hidden");
}

// Extract YouTube ID
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
previewBtn.addEventListener("click", () => {
  let loaded = 0;
  downloadBtn.disabled = true;

  inputs.forEach((input, i) => {
    const id = getYouTubeID(input.value.trim());

    if (!id) {
      images[i].src = "";
      return;
    }

    images[i].crossOrigin = "anonymous";
    images[i].src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    images[i].onload = () => {
      loaded++;
      if (loaded === images.length) {
        downloadBtn.disabled = false;
      }
    };

    images[i].onerror = () => {
      downloadBtn.disabled = true;
    };
  });
});

// Download image
downloadBtn.addEventListener("click", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const size = 150;
  canvas.width = size * 3;
  canvas.height = size * 3;

  progressBar.classList.remove("hidden");
  progressBar.value = 0;

  images.forEach((img, index) => {
    if (!img.complete || img.naturalWidth === 0) return;

    const x = (index % 3) * size;
    const y = Math.floor(index / 3) * size;
    ctx.drawImage(img, x, y, size, size);

    progressBar.value += 100 / images.length;
  });

  const dataUrl = canvas.toDataURL("image/png");
  progressBar.classList.add("hidden");

  // Mobile: open image
  if (isMobile) {
    window.open(dataUrl, "_blank");
    return;
  }

  // Desktop: download
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "youtube-collage.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Drag & drop (desktop)
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
  const temp = images[a].src;
  images[a].src = images[b].src;
  images[b].src = temp;
}

function swapInputs(a, b) {
  const temp = inputs[a].value;
  inputs[a].value = inputs[b].value;
  inputs[b].value = temp;
}
