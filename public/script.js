// Preview selected cake image before upload
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector("input[name='cakeImage']");
  const preview = document.createElement("img");
  preview.style.maxWidth = "200px";
  preview.style.marginTop = "10px";

  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          fileInput.parentNode.appendChild(preview);
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
