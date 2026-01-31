const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");

const playlistBox = document.getElementById("playlistBox");
const playlistUrlInput = document.getElementById("playlistUrl");
const copyPlaylistBtn = document.getElementById("copyPlaylist");

function getYouTubeID(url) {
  if (!url) return null;
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

function updatePreview() {
  let allValid = true;

  inputs.forEach((input, i) => {
    const id = getYouTubeID(input.value.trim());
    if (!id) {
      images[i].src = "";
      allValid = false;
      return;
    }
    images[i].src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  });

  downloadBtn.disabled = !allValid;

  const playlistUrl = generatePlaylistUrl();
  if (playlistUrl) {
    playlistUrlInput.value = playlistUrl;
    playlistBox.classList.remove("hidden");
  } else {
    playlistBox.classList.add("hidden");
  }
}

previewBtn.addEventListener("click", updatePreview);

/* ✅ Desktop-safe download */
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

  const promises = Array.from(images).map(img => {
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

  Promise.all(promises).then(() => {
    images.forEach((img, i) => {
      const x = (i % 3) * size;
      const y = Math.floor(i / 3) * size;
      ctx.drawImage(img, x, y, size, size);
    });

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        window.open(url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = "youtube-collage.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      URL.revokeObjectURL(url);
      progressBar.classList.add("hidden");
    });
  });
});

copyPlaylistBtn.addEventListener("click", () => {
  playlistUrlInput.select();
  navigator.clipboard.writeText(playlistUrlInput.value);
  alert("Playlist link copied!");
});

/* Drag & drop */
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
