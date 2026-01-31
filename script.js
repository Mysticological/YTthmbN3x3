const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");

const playlistBox = document.getElementById("playlistBox");
const playlistUrlInput = document.getElementById("playlistUrl");
const copyPlaylistBtn = document.getElementById("copyPlaylist");

const canvas = document.getElementById("canvas");

/* ---------- Helpers ---------- */

function getYouTubeID(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function generatePlaylistUrl(ids) {
  return `https://www.youtube.com/watch_videos?video_ids=${ids.join(",")}`;
}

/* ---------- Preview ---------- */

previewBtn.addEventListener("click", () => {
  progressBar.classList.remove("hidden");
  progressBar.value = 0;
  downloadBtn.disabled = true;

  let validIds = [];
  let loaded = 0;

  inputs.forEach((input, i) => {
    const id = getYouTubeID(input.value.trim());

    if (!id) {
      images[i].src = "";
      return;
    }

    validIds.push(id);
    images[i].src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    images[i].onload = images[i].onerror = () => {
      loaded++;
      progressBar.value = (loaded / 9) * 100;

      if (loaded === 9) {
        progressBar.classList.add("hidden");
        downloadBtn.disabled = false;
      }
    };
  });

  // Playlist (only when all 9 URLs valid)
  if (validIds.length === 9) {
    playlistUrlInput.value = generatePlaylistUrl(validIds);
    playlistBox.classList.remove("hidden");
  } else {
    playlistBox.classList.add("hidden");
  }
});

/* ---------- Copy Playlist ---------- */

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
