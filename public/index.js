let input = document.getElementById("input");
let image = document.getElementById("photo");
let download = document.getElementById("download");
input.addEventListener("input", (e) => {
  let reader = new FileReader();
  reader.readAsArrayBuffer(e.target.files[0]);
  console.log(e.target.files[0]);
  let fileFormat = e.target.files[0].type;
  reader.onload = async (e) => {
    console.log(e);
    let formData = new FormData();
    formData.append("data", e.target.result);
    let res = await fetch(`http://localhost:3000/${fileFormat}/450/300`, {
      body: e.target.result,
      method: "POST",
    });
    let reader = res.body.getReader();
    let base64 = "";
    reader.read().then(async function readResponse({ done, value }) {
      if (done) {
        //   console.log("Done Reading");
        const base64Response = await fetch(
          `data:image/${fileFormat};base64,${base64}`
        );
        const blob = await base64Response.blob();
        let url = URL.createObjectURL(blob);
        image.src = url;
        download.download = "image.png";
        download.href = url;
        return;
      }
      console.log(value.byteLength);
      base64 += String.fromCharCode.apply(null, value);
      return reader.read().then(readResponse);
    });

    // res.text().then(async function getResponseText(value) {
    //   console.log(value.length);
    //   // const base64Response = await fetch(`data:image/jpeg;base64,${value}`);
    //   // const blob = await base64Response.blob();
    //   // let url = URL.createObjectURL(blob);
    //   // image.src = url;

    //   return res.text().then(getResponseText);
    // });

    // let reader = res.body.getReader();
    // reader.read().then(function processBody({ done, value }) {
    //   console.log(value.byteLength);
    //   arr.push(value);
    //   if (done) {
    //     let blob = new Blob(arr);
    //     // const blob = await res.blob();
    //     console.log(blob.size);
    //     return;
    //   }
    //   return reader.read().then(processBody);
    // });
    // console.log(e.target.result);
  };
});
// input.addEventListener("change", (e) => {
//   let formData = new FormData(document.forms.submitImage);
//   console.log(formData);
// });
