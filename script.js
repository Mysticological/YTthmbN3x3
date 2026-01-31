const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");
const canvas = document.getElementById("canvas");

const playlistBox = document.getElementById("playlistBox");
const playlistUrlInput = document.getElementById("playlistUrl");
const copyPlaylistBtn = document.getElementById("copyPlaylist");

let finalImageBlob = null;

/* ------------------ Utilities ------------------ */

function getYouTubeID(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function generatePlaylistUrl() {
  const ids = Array.from(inputs)
    .map(i => getYouTubeID(i.value.trim()))
    .filter(Boolean);

  return ids.length >= 2
    ? `https://www.youtube.com/watch_videos?video_ids=${ids.join(",")}`
    : null;
}

/* ------------------ Preview ------------------ */

previewBtn.addEventListener("click", async () => {
  progressBar.classList.remove("hidden");
  progressBar.value = 0;
  finalImageBlob = null;
  downloadBtn.disabled = true;

  let valid = true;
  const loadPromises = [];

  inputs.forEach((input, i) => {
    const id = getYouTubeID(input.value.trim());
    if (!id) {
      images[i].src = "";
      valid = false;
      return;
    }

    images[i].src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    loadPromises.push(
      new Promise(resolve => {
        images[i].onload = images[i].onerror = () => resolve();
      })
    );
  });

  if (!valid) {
    progressBar.classList.add("hidden");
    return;
  }

  let loaded = 0;
  loadPromises.forEach(p =>
    p.then(() => {
      loaded++;
      progressBar.value = (loaded / 9) * 100;
    })
  );

  await Promise.all(loadPromises);

  /* Build canvas ON PREVIEW */
  const ctx = canvas.getContext("2d");
  const size = 150;

  canvas.width = size * 3;
  canvas.height = size * 3;

  images.forEach((img, i) => {
    const x = (i % 3) * size;
    const y = Math.floor(i / 3) * size;
    ctx.drawImage(img, x, y, size, size);
  });

  canvas.toBlob(blob => {
    finalImageBlob = blob;
    downloadBtn.disabled = false;
    progressBar.classList.add("hidden");
  });

  /* Playlist */
  const playlist = generatePlaylistUrl();
  if (playlist) {
    playlistUrlInput.value = playlist;
    playlistBox.classList.remove("hidden");
  } else {
    playlistBox.classList.add("hidden");
  }
});

/* ------------------ Download ------------------ */

downloadBtn.addEventListener("click", () => {
  if (!finalImageBlob) return;

  const url = URL.createObjectURL(finalImageBlob);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = "youtube-collage.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  URL.revokeObjectURL(url);
});

/* ------------------ Playlist Copy ------------------ */

copyPlaylistBtn.addEventListener("click", () => {
  playlistUrlInput.select();
  navigator.clipboard.writeText(playlistUrlInput.value);
  alert("Playlist copied!");
});

/* ------------------ Drag & Drop ------------------ */

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
