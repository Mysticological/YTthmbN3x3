// =====================
// DOM ELEMENTS
// =====================
const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");

const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");

const playlistBox = document.getElementById("playlistBox");
const playlistUrlInput = document.getElementById("playlistUrl");
const copyPlaylistBtn = document.getElementById("copyPlaylist");

const canvas = document.getElementById("canvas");

// Track image load status
let imagesLoaded = Array(9).fill(false);

// =====================
// YOUTUBE ID HELPER
// =====================
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

// =====================
// PROMISE IMAGE LOADER
// =====================
function loadImageWithPromise(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// =====================
// PLAYLIST GENERATOR
// =====================
function generatePlaylistURL() {
  const ids = Array.from(inputs)
    .map(input => getYouTubeID(input.value.trim()))
    .filter(Boolean);

  if (ids.length !== 9) {
    playlistBox.classList.add("hidden");
    playlistUrlInput.value = "";
    return;
  }

  const url = `https://www.youtube.com/watch_videos?video_ids=${ids.join(",")}`;
  playlistUrlInput.value = url;
  playlistBox.classList.remove("hidden");
}

// Copy playlist URL
copyPlaylistBtn.addEventListener("click", () => {
  playlistUrlInput.select();
  document.execCommand("copy");
  copyPlaylistBtn.textContent = "Copied!";
  setTimeout(() => (copyPlaylistBtn.textContent = "Copy"), 1500);
});

// =====================
// PREVIEW HANDLER
// =====================
function updatePreview() {
  imagesLoaded = Array(9).fill(false);
  let allValid = true;

  inputs.forEach((input, i) => {
    const videoId = getYouTubeID(input.value.trim());

    if (!videoId) {
      images[i].src = "";
      allValid = false;
      return;
    }

    const src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    images[i].src = src;

    images[i].onload = () => {
      imagesLoaded[i] = true;
      checkReadyState();
    };

    images[i].onerror = () => {
      imagesLoaded[i] = false;
      checkReadyState();
    };
  });

  downloadBtn.disabled = !allValid;
  progressBar.classList.add("hidden");

  generatePlaylistURL();
}

// Enable download only when all images loaded
function checkReadyState() {
  if (imagesLoaded.every(Boolean)) {
    downloadBtn.disabled = false;
  }
}

previewBtn.addEventListener("click", updatePreview);

// =====================
// DOWNLOAD HANDLER (PROMISE-BASED)
// =====================
downloadBtn.addEventListener("click", async () => {
  if (!imagesLoaded.every(Boolean)) {
    alert("Images are still loading. Please wait.");
    return;
  }

  const size = 150;
  const ctx = canvas.getContext("2d");

  canvas.width = size * 3;
  canvas.height = size * 3;

  progressBar.classList.remove("hidden");
  progressBar.value = 0;

  try {
    const promisedImages = await Promise.all(
      Array.from(images).map(img => loadImageWithPromise(img.src))
    );

    promisedImages.forEach((img, i) => {
      const x = (i % 3) * size;
      const y = Math.floor(i / 3) * size;
      ctx.drawImage(img, x, y, size, size);
      progressBar.value = ((i + 1) / 9) * 100;
    });

    const dataURL = canvas.toDataURL("image/png");
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.open(dataURL, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "youtube-collage.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  } catch (err) {
    console.error(err);
    alert("Failed to generate image. Please try again.");
  }

  progressBar.classList.add("hidden");
});

// =====================
// DRAG & DROP (DESKTOP)
// =====================
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
    swapLoaded(draggedIndex, index);
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

function swapLoaded(a, b) {
  const temp = imagesLoaded[a];
  imagesLoaded[a] = imagesLoaded[b];
  imagesLoaded[b] = temp;
}
