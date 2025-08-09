export function setupCreatePost(basePath) {
  const form = document.getElementById("newPostForm");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const title = document.getElementById("title").value;
      const content = document.getElementById("content").value;
      const imageUrl = document.getElementById("imageUrl").value;
      const tags = document
        .getElementById("tags")
        .value.split(",")
        .map((tag) => tag.trim());

      const postData = {
        title,
        body: convertToParagraphs(content),
        tags,
        media: {
          url: imageUrl,
        },
      };

      try {
        const response = await fetch(
          "https://v2.api.noroff.dev/blog/posts/Nik_Bishop",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify(postData),
          }
        );
        if (response.ok) {
          alert("Post created successfully!");
          window.location.href = basePath + "index.html";
        } else {
          const errorData = await response.json();
          console.error("Error Response:", errorData);
          document.getElementById("postError").textContent =
            errorData.message || "Failed to create post";
          document.getElementById("postError").style.display = "block";
        }
      } catch (error) {
        console.error("Error during post creation:", error);
        document.getElementById("postError").textContent =
          "An unexpected error occurred.";
        document.getElementById("postError").style.display = "block";
      }
    });
  }

  const contentElement = document.getElementById("content");
  if (contentElement) {
    contentElement.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }
}

function convertToParagraphs(text) {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .filter((para) => para.trim() !== "")
    .map((para) => `<p>${para.trim()}</p>`)
    .join("");
}
