let input = document.getElementById("input");
let imageContainer = document.getElementById("image-cont");
let download = document.getElementById("download");
let qualityIndicator = document.getElementById("quality-indicator-badge");
let qualitySlider = document.getElementById("quality");
let resize = document.getElementById("resize");
let widthInput = document.getElementById("width");
let heightInput = document.getElementById("height");
let uploadedImageContainer = document.getElementById("size-details");
let uploadedFileName = document.getElementById("uploaded-file-name");
let uploadedFileSize = document.getElementById("uploaded-size");
let resizeDetailsForm = document.getElementById("resize-form");
let resizeButton = document.getElementById("resize-button");
let fileFormat;
let body;
//sets indicator value on load
window.addEventListener("load", () => {
  qualityIndicator.value = qualitySlider.value;
});
widthInput.addEventListener("input", (e) => {});
//sets indicator value on change in slider
qualitySlider.addEventListener("input", (e) => {
  qualityIndicator.value = parseInt(e.target.value);
});

//sets slider value on change in input of quality
qualityIndicator.addEventListener("input", (e) => {
  if (e.target.value.substring(0, 3) == "100") {
    e.target.value = "100";
    qualitySlider.value = "100";
  } else if (e.target.valueAsNumber > 100) {
    qualitySlider.value = e.target.value.substring(0, 2);
    e.target.value = e.target.value.substring(0, 2);
  } else {
    qualitySlider.value = e.target.value;
  }
});

//sets resize options to readonly and writable on change of resize checkbox
resize.addEventListener("change", (e) => {
  console.log(e);
  if (e.target.checked == true) {
    widthInput.removeAttribute("readonly");
    widthInput.classList.remove("readonly");
    widthInput.classList.add("active");
    heightInput.removeAttribute("readonly");
    heightInput.classList.remove("readonly");
    heightInput.classList.add("active");
  }
  if (e.target.checked == false) {
    widthInput.setAttribute("readonly", "true");
    widthInput.classList.remove("active");
    widthInput.classList.add("readonly");
    heightInput.setAttribute("readonly", "true");
    heightInput.classList.remove("active");
    heightInput.classList.add("readonly");
  }
});
//listens for file input
input.addEventListener("input", (e) => {
  // console.log(e);
  let reader = new FileReader();

  // console.log(e.target.files[0]);

  //shows image details (that were hidden earlier)
  uploadedImageContainer.classList.remove("display-none");
  uploadedImageContainer.classList.add("size-details");

  //adds content to the image details
  uploadedFileName.innerText = `${e.target.files[0].name}`;
  uploadedFileSize.innerText = `${e.target.files[0].size / 1000}kb`;

  //sets file format that is needed route param
  fileFormat = e.target.files[0].type;

  //read as array buffer for server

  reader.readAsArrayBuffer(e.target.files[0]);
  reader.onload = async (e) => {
    // let formData = new FormData();
    // formData.append("data", e.target.result);
    body = e.target.result;

    // console.log(e.target.result);
  };
});
input.addEventListener("input", (e) => {
  //new instance of file reader object
  resizeButton.removeAttribute("disabled");
  resizeButton.classList.remove("btn-readonly");
  resizeButton.classList.add("btn-active");

  let reader = new FileReader();

  //read as URL to get width height
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = (e) => {
    let image = new Image();
    image.src = e.target.result;
    image.onload = (e) => {
      const { width, height } = e.target;
      console.log(width, height);
      widthInput.value = width;
      heightInput.value = height;
    };
  };
});

//onclick of resize button
resizeButton.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("annotation-for-resize").innerText = "Resizing...";
  let loader = document.createElement("span");
  loader.classList.add("loader");
  loader.id = "loader";
  imageContainer.appendChild(loader);

  //sends request
  sendToServer(
    fileFormat,
    qualityIndicator.value,
    widthInput.value,
    heightInput.value,
    body
  );
});

//sends request
async function sendToServer(fileformat, quality, width, height, body) {
  let res = await fetch(
    `https://sharpsized.azurewebsites.net/${fileFormat}/${qualityIndicator.value}/${widthInput.value}/${heightInput.value}`,
    {
      body,
      method: "POST",
    }
  );
  let base64 = "";
  let reader = res.body.getReader();
  reader.read().then(async function readResponse({ done, value }) {
    //only if done this will execute
    if (done) {
      const base64Response = await fetch(`data:${fileFormat};base64,${base64}`);
      const blob = await base64Response.blob();
      let url = URL.createObjectURL(blob);
      let image = document.createElement("img");
      image.classList.add("fit-container");
      image.src = url;
      imageContainer.removeChild(
        document.getElementById("annotation-for-resize")
      );
      imageContainer.removeChild(document.getElementById("loader"));
      imageContainer.appendChild(image);
      download.classList.remove("btn-readonly");
      download.classList.add("btn-active");
      download.download = `image.${fileFormat.split("/")[1]}`;
      download.href = url;
      return;
    }
    base64 += String.fromCharCode.apply(null, value);
    return reader.read().then(readResponse);
  });
}
