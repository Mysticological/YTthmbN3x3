// Grab DOM elements
const inputs = document.querySelectorAll("#inputs input");
const images = document.querySelectorAll(".cell img");
const downloadBtn = document.getElementById("downloadBtn");

// Helper: Extract YouTube video ID from URL
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

// Load thumbnails from inputs (still on Preview button click)
function updatePreview() {
  let allFilled = true;

  inputs.forEach((input, i) => {
    const videoId = getYouTubeID(input.value.trim());

    if (!videoId) {
      images[i].src = "";
      allFilled = false;
      return;
    }

    // Use hqdefault.jpg for reliability
    images[i].src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  });

  downloadBtn.disabled = !allFilled;
}

// Optional: attach to a Preview button if you kept it
const previewBtn = document.getElementById("previewBtn");
if (previewBtn) {
  previewBtn.addEventListener("click", updatePreview);
}

// Download collage as a single image
downloadBtn.addEventListener("click", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const size = 150; // each cell 150x150
  canvas.width = size * 3;
  canvas.height = size * 3;

  // Wait for all images to finish loading
  const loadPromises = Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth !== 0) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // skip broken images
      }
    });
  });

  Promise.all(loadPromises).then(() => {
    images.forEach((img, index) => {
      const x = (index % 3) * size;
      const y = Math.floor(index / 3) * size;
      ctx.drawImage(img, x, y, size, size);
    });

    // Trigger download
    const link = document.createElement("a");
    link.download = "youtube-collage.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

