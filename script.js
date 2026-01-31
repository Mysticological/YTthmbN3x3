const inputs = document.querySelectorAll("#inputs input");
const gridImages = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");

const mergedPreview = document.getElementById("mergedPreview");
const mergedImages = document.querySelectorAll(".mergedGrid img");

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

// Restore state after refresh
window.addEventListener("load", () => {
  const saved = JSON.parse(sessionStorage.getItem("ytUrls"));
  if (!saved) return;

  saved.forEach((url, i) => {
    inputs[i].value = url;
    const id = getYouTubeID(url);
    if (!id) return;

    const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    gridImages[i].src = thumb;
    mergedImages[i].src = thumb;
  });

  mergedPreview.classList.remove("hidden");
  mergedPreview.scrollIntoView({ behavior: "smooth" });
  downloadBtn.disabled = false;
});

// Preview = save + refresh
previewBtn.addEventListener("click", () => {
  const urls = Array.from(inputs).map(i => i.value.trim());
  sessionStorage.setItem("ytUrls", JSON.stringify(urls));
  location.reload();
});

// Desktop-only download
downloadBtn.addEventListener("click", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const size = 300;
  canvas.width = size * 3;
  canvas.height = size * 3;

  mergedImages.forEach((img, index) => {
    const x = (index % 3) * size;
    const y = Math.floor(index / 3) * size;
    ctx.drawImage(img, x, y, size, size);
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "youtube-collage.png";
  link.click();
});
