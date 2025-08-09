const apiEndpoint = "https://v2.api.noroff.dev/blog/posts/Nik_Bishop";
const postsPerPage = 12;
let currentPage = 1;
let totalPages = 1;
let allPosts = [];
let isNewestFirst = true;

export function setupPosts(basePath) {
  const postGrid = document.getElementById("post-grid");
  if (postGrid) {
    loadInitialPosts(basePath);
    setupTagFilter(basePath);
    setupShowMoreButton(basePath);
    setupToggleOrderButton(basePath);
  }

  setupBlogPostIndex(basePath);
}

async function fetchPosts() {
  try {
    const response = await fetch(`${apiEndpoint}`);
    const data = await response.json();
    allPosts = data.data.sort(
      (a, b) => new Date(b.created) - new Date(a.created)
    );
    totalPages = Math.ceil(allPosts.length / postsPerPage);
    return allPosts.slice(0, postsPerPage);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

function populatePostGrid(posts, basePath, append = false) {
  const postGrid = document.getElementById("post-grid");

  if (!postGrid) return;

  if (!append) {
    postGrid.innerHTML = "";
  }

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post-square";

    postElement.innerHTML = `
      <a href="${basePath}post/index.html?id=${post.id}">
        <img src="${post.media.url}" alt="${
      post.media.alt
    }" class="post-square-image">
      </a>
      <div class="post-square-content">
        <h2><a href="${basePath}post/index.html?id=${post.id}">${
      post.title
    }</a></h2>
        <p>${post.author.name}</p>
        <p>${new Date(post.created).toLocaleDateString()}</p>
      </div>
    `;

    postGrid.appendChild(postElement);
  });
}

async function loadInitialPosts(basePath) {
  const initialPosts = await fetchPosts();
  populatePostGrid(initialPosts, basePath);
  updateShowMoreButton();
}

function loadMorePosts(basePath) {
  const startIndex = currentPage * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const additionalPosts = allPosts.slice(startIndex, endIndex);
  populatePostGrid(additionalPosts, basePath, true);
  currentPage++;
  updateShowMoreButton();
}

function updateShowMoreButton() {
  const showMoreBtn = document.getElementById("showMoreBtn");
  if (showMoreBtn) {
    showMoreBtn.disabled = currentPage >= totalPages;
  }
}

function setupTagFilter(basePath) {
  const tagFilter = document.getElementById("tagFilter");
  if (tagFilter) {
    tagFilter.addEventListener("input", function () {
      const tag = this.value.trim().toLowerCase();
      const filteredPosts = allPosts.filter((post) =>
        post.tags.some((postTag) => postTag.toLowerCase().includes(tag))
      );
      currentPage = 1;
      populatePostGrid(filteredPosts.slice(0, postsPerPage), basePath);
      updateShowMoreButton();
    });
  }
}

function setupShowMoreButton(basePath) {
  const showMoreBtn = document.getElementById("showMoreBtn");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => loadMorePosts(basePath));
  }
}

function setupToggleOrderButton(basePath) {
  const toggleOrderBtn = document.getElementById("toggleOrderBtn");
  if (toggleOrderBtn) {
    toggleOrderBtn.addEventListener("click", () => togglePostOrder(basePath));
  }
}

function togglePostOrder(basePath) {
  isNewestFirst = !isNewestFirst;
  allPosts.reverse();
  currentPage = 1;
  populatePostGrid(allPosts.slice(0, postsPerPage), basePath);
  updateShowMoreButton();
  const toggleOrderBtn = document.getElementById("toggleOrderBtn");
  toggleOrderBtn.textContent = `Order: ${
    isNewestFirst ? "Newest" : "Oldest"
  } First`;
}

export function initializeCarousel(
  carouselWrapper,
  leftArrow,
  rightArrow,
  basePath
) {
  const loadingAnimation = document.createElement("div");
  loadingAnimation.className = "lds-circle";
  loadingAnimation.innerHTML = "<div></div>";

  const loadingContainer = document.createElement("div");
  loadingContainer.className = "carousel-loading";
  loadingContainer.appendChild(loadingAnimation);

  carouselWrapper.appendChild(loadingContainer);

  fetchCarouselPosts().then((posts) => {
    carouselWrapper.removeChild(loadingContainer);

    posts.forEach((post) => {
      carouselWrapper.appendChild(createCarouselItem(post, basePath));
    });

    leftArrow.addEventListener("click", () =>
      animateCarousel(-1, carouselWrapper)
    );
    rightArrow.addEventListener("click", () =>
      animateCarousel(1, carouselWrapper)
    );
  });
}

async function fetchCarouselPosts() {
  try {
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    return data.data
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 5);
  } catch (error) {
    console.error("Error fetching carousel posts:", error);
    return [];
  }
}

function createCarouselItem(post, basePath) {
  const item = document.createElement("div");
  item.className = "carousel-item";
  item.innerHTML = `
    <a href="${basePath}post/index.html?id=${post.id}">
      <img src="${post.media.url}" alt="${
    post.media.alt
  }" class="carousel-item-image">
    </a>
    <div class="carousel-item-content">
      <h2><a href="${basePath}post/index.html?id=${post.id}">${
    post.title
  }</a></h2>
      <p>${post.author.name}</p>
      <p>${new Date(post.created).toLocaleDateString()}</p>
    </div>
  `;
  return item;
}

function rotateCarousel(direction, carouselWrapper) {
  if (direction > 0) {
    const firstItem = carouselWrapper.firstElementChild;
    carouselWrapper.appendChild(firstItem);
  } else {
    const lastItem = carouselWrapper.lastElementChild;
    carouselWrapper.prepend(lastItem);
  }
}

function animateCarousel(direction, carouselWrapper) {
  const itemWidth = carouselWrapper.firstElementChild.offsetWidth;
  const gapWidth = 20;
  const distance = itemWidth + gapWidth;

  carouselWrapper.style.transition = "transform 0.5s ease";
  carouselWrapper.style.transform = `translateX(${-direction * distance}px)`;

  setTimeout(() => {
    carouselWrapper.style.transition = "none";
    carouselWrapper.style.transform = "translateX(0)";
    rotateCarousel(direction, carouselWrapper);
  }, 500);
}

function setupBlogPostIndex(basePath) {
  const postContent = document.getElementById("post-content");
  if (postContent) {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    async function fetchPost(id) {
      try {
        const response = await fetch(
          `https://v2.api.noroff.dev/blog/posts/Nik_Bishop/${id}`
        );
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Error fetching post:", error);
        return null;
      }
    }

    function formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function displayPost(post) {
      const shareableLink = `${window.location.origin}${basePath}post/index.html?id=${post.id}`;

      let postHTML = `
        <img src="${post.media.url}" alt="${post.media.alt}" class="post-image">
        <h1 class="post-title">${post.title}</h1>
        <p class="post-author">By ${post.author.name}</p>
        <p class="post-date">Posted on ${formatDate(post.created)}</p>
        <div class="post-body">${post.body}</div>
        <div class="shareable-link-container">
          <input type="text" value="${shareableLink}" readonly class="shareable-link-input" id="shareableLink">
          <button id="copyLinkBtn" class="btn">Copy</button>
        </div>
        <div class="post-tags">
          ${post.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      `;

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        postHTML += `
          <button id="editPostBtn" class="btn">EDIT POST</button>
        `;
      }

      postContent.innerHTML = postHTML;

      const copyLinkBtn = document.getElementById("copyLinkBtn");
      const shareableLinkInput = document.getElementById("shareableLink");

      copyLinkBtn.addEventListener("click", () => {
        shareableLinkInput.select();
        document.execCommand("copy");
        copyLinkBtn.textContent = "Copied!";
        setTimeout(() => {
          copyLinkBtn.textContent = "Copy";
        }, 2000);
      });

      if (accessToken) {
        document.getElementById("editPostBtn").addEventListener("click", () => {
          window.location.href = `${basePath}post/edit.html?id=${post.id}`;
        });
      }
    }

    async function loadPost() {
      const post = await fetchPost(postId);
      if (post) {
        displayPost(post);
      } else {
        postContent.innerHTML =
          "<p>Error loading post. Please try again later.</p>";
      }
    }

    loadPost();
  }
}
