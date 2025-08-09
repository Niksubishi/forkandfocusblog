export function setupEditPost(basePath) {
  if (document.getElementById("editPostForm")) {
    const editPostForm = document.getElementById("editPostForm");
    const deletePostBtn = document.getElementById("deletePostBtn");
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      window.location.href = "../account/login.html";
      return;
    }

    async function fetchPost() {
      try {
        const response = await fetch(
          `https://v2.api.noroff.dev/blog/posts/Nik_Bishop/${postId}`
        );
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Error fetching post:", error);
        return null;
      }
    }

    async function populateForm() {
      const post = await fetchPost();
      if (post) {
        document.getElementById("title").value = post.title;
        document.getElementById("content").value = post.body
          .replace(/<p>/g, "")
          .replace(/<\/p>/g, "\n\n")
          .trim();
        document.getElementById("imageUrl").value = post.media.url;
        document.getElementById("imageAlt").value = post.media.alt;
        document.getElementById("tags").value = post.tags.join(", ");
      }
    }

    editPostForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const updatedPost = {
        title: document.getElementById("title").value,
        body: convertToParagraphs(document.getElementById("content").value),
        tags: document
          .getElementById("tags")
          .value.split(",")
          .map((tag) => tag.trim()),
        media: {
          url: document.getElementById("imageUrl").value,
          alt: document.getElementById("imageAlt").value,
        },
      };

      try {
        const response = await fetch(
          `https://v2.api.noroff.dev/blog/posts/Nik_Bishop/${postId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updatedPost),
          }
        );

        if (response.ok) {
          alert("Post updated successfully!");
          window.location.href = `../post/index.html?id=${postId}`;
        } else {
          const errorData = await response.json();
          alert(`Failed to update post: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error updating post:", error);
        alert("An unexpected error occurred while updating the post.");
      }
    });

    deletePostBtn.addEventListener("click", async function () {
      if (confirm("Are you sure you want to delete this post?")) {
        try {
          const response = await fetch(
            `https://v2.api.noroff.dev/blog/posts/Nik_Bishop/${postId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            alert("Post deleted successfully!");
            window.location.href = "../index.html";
          } else {
            const errorData = await response.json();
            alert(`Failed to delete post: ${errorData.message}`);
          }
        } catch (error) {
          console.error("Error deleting post:", error);
          alert("An unexpected error occurred while deleting the post.");
        }
      }
    });

    populateForm();
  }

  // ADDPOSTTEXT
  const contentElement = document.getElementById("content");
  if (contentElement) {
    function adjustHeight() {
      contentElement.style.height = "auto";
      contentElement.style.height = contentElement.scrollHeight + "px";
    }

    adjustHeight();
    contentElement.addEventListener("input", adjustHeight);

    setTimeout(adjustHeight, 100);
    setTimeout(adjustHeight, 500);
    setTimeout(adjustHeight, 1000);
  }
}

function convertToParagraphs(text) {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .filter((para) => para.trim() !== "")
    .map((para) => `<p>${para.trim()}</p>`)
    .join("");
}
