const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");
const canvas = document.getElementById("canvas");

const playlistBox = document.getElementById("playlistBox");
const playlistUrlInput = document.getElementById("playlistUrl");
const copyPlaylistBtn = document.getElementById("copyPlaylist");

let finalBlob = null;
let finalDataURL = null;

/* ---------- Utilities ---------- */

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

  if (ids.length < 2) return null;
  return `https://www.youtube.com/watch_videos?video_ids=${ids.join(",")}`;
}

/* ---------- Preview ---------- */

previewBtn.addEventListener("click", async () => {
  progressBar.classList.remove("hidden");
  progressBar.value = 0;
  downloadBtn.disabled = true;
  finalBlob = null;
  finalDataURL = null;

  const ids = [];
  let loadCount = 0;

  inputs.forEach((input, i) => {
    const id = getYouTubeID(input.value.trim());
    if (!id) return;
    ids.push(id);

    images[i].src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    images[i].onload = images[i].onerror = () => {
      loadCount++;
      progressBar.value = (loadCount / 9) * 100;
    };
  });

  // Playlist ALWAYS handled
  const playlist = generatePlaylistUrl();
  if (playlist) {
    playlistUrlInput.value = playlist;
    playlistBox.classList.remove("hidden");
  } else {
    playlistBox.classList.add("hidden");
  }

  // Wait for images
  await Promise.all(
    Array.from(images).map(
      img =>
        new Promise(resolve => {
          if (img.complete && img.naturalWidth) resolve();
          else img.onload = img.onerror = resolve;
        })
    )
  );

  // Build canvas
  const ctx = canvas.getContext("2d");
  const size = 150;
  canvas.width = size * 3;
  canvas.height = size * 3;

  images.forEach((img, i) => {
    const x = (i % 3) * size;
    const y = Math.floor(i / 3) * size;
    ctx.drawImage(img, x, y, size, size);
  });

  finalDataURL = canvas.toDataURL("image/png");
  canvas.toBlob(blob => {
    finalBlob = blob;
    downloadBtn.disabled = false;
    progressBar.classList.add("hidden");
  });
});

/* ---------- Download ---------- */

downloadBtn.addEventListener("click", () => {
  if (!finalDataURL) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.open(finalDataURL, "_blank");
  } else if (finalBlob) {
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "youtube-top9.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});

/* ---------- Playlist Copy ---------- */

copyPlaylistBtn.addEventListener("click", () => {
  playlistUrlInput.select();
  navigator.clipboard.writeText(playlistUrlInput.value);
  alert("Playlist copied!");
});

/* ---------- Drag & Drop ---------- */

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
