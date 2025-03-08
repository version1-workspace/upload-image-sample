async function fetchPosts() {
  const res = await fetch("/api/v1/posts");
  return await res.json();
}

async function addPosts() {
  const form = new FormData(document.getElementById("add-post"));
  const formEntries = [...form.entries()];
  const data = formEntries.reduce((acc, [key, value]) => {
    if (key === "images[]") {
      return { ...acc, images: [...(acc.images || []), value] };
    }
    return { ...acc, [key]: value };
  }, {});

  const images = await Promise.all(
    data.images.map(async (image) => {
      return uploadImage(image);
    }),
  );

  const postData = {
    body: data.body,
    images,
  };
  const res = await fetch("/api/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: postData,
    }),
  });
  return await res.json();
}

async function uploadImage(image) {
  const signatureResponse = await fetch("/api/v1/images/signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const {
    data: { signature, timestamp },
  } = await signatureResponse.json();

  const { cloudName, apiKey } = window.cloudinaryApi;
  const formData = new FormData();
  formData.append("file", image);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  const uploadResBody = await uploadResponse.json();
  return {
    id: uploadResBody.asset_id,
    publicId: uploadResBody.public_id,
    displayName: uploadResBody.display_name,
    originalName: uploadResBody.original_filename,
    size: uploadResBody.bytes,
    url: uploadResBody.url,
    format: uploadResBody.format,
    height: uploadResBody.height,
    width: uploadResBody.width,
  };
}

function renderPosts(posts) {
  const postsElement = document.getElementById("posts");
  postsElement.innerHTML = "";
  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.setAttribute("class", "post-item");
    post.images.forEach((image) => {
      const imgElement = document.createElement("img");
      imgElement.src = image.variants.high;
      imgElement.setAttribute("class", "post-image");
      postElement.appendChild(imgElement);
    });
    const bodyElement = document.createElement("p");
    bodyElement.innerText = post.body;
    bodyElement.setAttribute("class", "post-body");
    postElement.appendChild(bodyElement);
    postsElement.appendChild(postElement);
  });
}

function addListeners() {
  document.getElementById("add-post").addEventListener("submit", async (e) => {
    e.preventDefault();
    await addPosts();
    await render();
  });
}

async function render() {
  const { data: posts } = await fetchPosts();
  renderPosts(posts);
}

async function main() {
  addListeners();
  await render();
}

try {
  main();
} catch (error) {
  console.error(error);
  alert("エラーが発生しました。");
}
