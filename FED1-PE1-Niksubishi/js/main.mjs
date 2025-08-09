import { setupAuth } from "./auth.mjs";
import { setupPosts, initializeCarousel } from "./posts.mjs";
import { setupCreatePost } from "./createPost.mjs";
import { setupEditPost } from "./editPost.mjs";

document.addEventListener("DOMContentLoaded", function () {
  const basePath = "/";

  setupAuth(basePath);
  setupPosts(basePath);
  setupCreatePost(basePath);
  setupEditPost(basePath);

  const carouselWrapper = document.querySelector(".carousel-wrapper");
  const leftArrow = document.querySelector(".left-arrow");
  const rightArrow = document.querySelector(".right-arrow");

  if (carouselWrapper && leftArrow && rightArrow) {
    initializeCarousel(carouselWrapper, leftArrow, rightArrow, basePath);
  }
});
