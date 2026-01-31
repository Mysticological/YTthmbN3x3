function getYouTubeID(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

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

const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");

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

inputs.forEach(input => {
  input.addEventListener("input", updatePreview);
});


downloadBtn.addEventListener("click", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const size = 150;
  canvas.width = size * 3;
  canvas.height = size * 3;

  images.forEach((img, index) => {
    const x = (index % 3) * size;
    const y = Math.floor(index / 3) * size;
    ctx.drawImage(img, x, y, size, size);
  });

  const link = document.createElement("a");
  link.download = "youtube-collage.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
