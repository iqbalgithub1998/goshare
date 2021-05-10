const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");
const progressContainer = document.querySelector(".progress-container");
const fileURL = document.querySelector("#fileURL");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const sharingContainer = document.querySelector(".sharing-container");
const percent = document.querySelector("#percent");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");

// api links  ..............
const host = "https://goshare-mik.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  !dropZone.classList.contains("dragged") && dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

const uploadFile = () => {
  const files = fileInput.files[0];
  console.log(files);
  if(files.size > 3e6){
    showToast("file Size should be less the 3MB","#B00020");
    fileInput.value = "";
    return;
  }
  progressContainer.style.display = "block";
  const formData = new FormData();
  formData.append("myfile", files);

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      showLink(JSON.parse(xhr.responseText));
    }
  };

  xhr.upload.onprogress = updateProgress;

  xhr.upload.onerror = () => {
    fileInput.value = "";
    progressContainer.style.display = "none";
    showToast(`Error in upload: ${xhr.statusText}`,"#B00020");
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

// calculate percentage ....................
const updateProgress = (e) => {
  const percentage = Math.round((e.loaded / e.total) * 100);
  // update progress percentage
  bgProgress.style.width = `${percentage}%`;
  percent.innerText = percentage;
  progressBar.style.transform = `scaleX(${percentage / 100})`;
};

const showLink = ({ file: url }) => {
  emailForm[2].removeAttribute("disabled");
  fileInput.value = "";
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURL.value = url;
};

// copy button code .................

copyBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Copy to clipboard", "#51ff0d");
});

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = fileURL.value;
  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  emailForm[2].setAttribute("disabled", "true");

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ success }) => {
      sharingContainer.style.display = "none";
      showToast("Email sent", "#03a9f4");
    })
    .catch((err) => {
      showToast("Server Error", "#B00020");
    });
});

let toastTimer;
const showToast = (msg, color) => {
  toast.style.background = color;
  toast.innerText = msg;
  toast.style.transform = "translate(-50%, 0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50%, -80px)";
  }, 2000);
};
