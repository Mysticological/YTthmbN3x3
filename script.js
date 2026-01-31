const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("progressBar");

const output = document.getElementById("output");
const finalImage = document.getElementById("finalImage");

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

// Preview thumbnails + generate combined image
previewBtn.addEventListener("click", async () => {
  let loaded = 0;
  downloadBtn.disabled = true;
  output.classList.add("hidden");

  images.forEach((img, i) => {
    const id = getYouTubeID(inputs[i].value.trim());
    if (!id) {
      img.src = "";
      return;
    }

    img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    img.onload = () => {
      loaded++;
      if (loaded === images.length) {
        generateCombinedImage();
        downloadBtn.disabled = false;
      }
    };
  });
});

function generateCombinedImage() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const size = 300;
  canvas.width = size * 3;
  canvas.height = size * 3;

  progressBar.classList.remove("hidden");
  progressBar.value = 0;

  images.forEach((img, index) => {
    const x = (index % 3) * size;
    const y = Math.floor(index / 3) * size;
    ctx.drawImage(img, x, y, size, size);
    progressBar.value += 100 / images.length;
  });

  const dataURL = canvas.toDataURL("image/png");
  finalImage.src = dataURL;
  output.classList.remove("hidden");

  progressBar.classList.add("hidden");
}

// Desktop download only
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = finalImage.src;
  link.download = "youtube-collage.png";
  link.click();
});
