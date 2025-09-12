// Preview selected cake image before upload
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector("input[name='cakeImage']");
  
  if (!fileInput) return;

  // Create preview image element
  const preview = document.createElement("img");
  preview.style.maxWidth = "200px";
  preview.style.marginTop = "10px";
  preview.style.display = "none"; // hide initially
  fileInput.parentNode.appendChild(preview);

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block"; // show preview
      };
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
      preview.style.display = "none"; // hide if no file selected
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector("input[name='cakeImage']");
  const preview = document.getElementById("preview");

  if (!fileInput) return;

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  });
});