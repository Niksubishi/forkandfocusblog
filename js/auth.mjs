export function setupAuth(basePath) {
  const navLinks = document.getElementById("nav-links");
  const accessToken = localStorage.getItem("accessToken");

  if (navLinks) {
    updateNavLinks(navLinks, accessToken, basePath);
  }

  setupLoginForm(basePath);
  setupRegisterForm(basePath);
}

function updateNavLinks(navLinks, accessToken, basePath) {
  if (accessToken) {
    navLinks.innerHTML = `
        <a href="${basePath}index.html" class="nav-link">HOME</a>
        <a href="${basePath}post/post.html" class="nav-link">NEW POST</a>
        <a href="#" id="logoutButton">LOGOUT</a>
      `;

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("accessToken");
        window.location.href = basePath + "account/login.html";
      });
    }
  } else {
    navLinks.innerHTML = `
        <a href="${basePath}index.html" class="nav-link">HOME</a>
        <a href="${basePath}account/login.html">LOGIN</a>
        <a href="${basePath}account/register.html">REGISTER</a>
      `;
  }
}

function setupLoginForm(basePath) {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const apiEndpoint = "https://v2.api.noroff.dev/auth/login";

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          document.getElementById("loginError").textContent =
            errorData.message || "Login failed.";
          document.getElementById("loginError").style.display = "block";
        } else {
          const data = await response.json();
          const accessToken = data.data
            ? data.data.accessToken
            : data.accessToken;
          localStorage.setItem("accessToken", accessToken);
          window.location.href = basePath + "index.html";
        }
      } catch (error) {
        console.error("Error during login:", error);
        document.getElementById("loginError").textContent =
          "An unexpected error occurred.";
        document.getElementById("loginError").style.display = "block";
      }
    });
  }
}

function setupRegisterForm(basePath) {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    const togglePassword = document.getElementById("togglePassword");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    function togglePasswordVisibility() {
      const type =
        password.getAttribute("type") === "password" ? "text" : "password";
      password.setAttribute("type", type);
      confirmPassword.setAttribute("type", type);
      togglePassword.textContent =
        type === "password" ? "Show password" : "Hide password";
    }

    togglePassword.addEventListener("click", togglePasswordVisibility);

    function showError(fieldId, message) {
      const errorElement = document.getElementById(`${fieldId}Error`);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
      }
    }

    function clearErrors() {
      const errorElements = document.querySelectorAll(".error-message");
      errorElements.forEach((element) => {
        element.textContent = "";
        element.style.display = "none";
      });
    }

    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearErrors();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const passwordValue = password.value;
      const confirmPasswordValue = confirmPassword.value;

      if (!/^[a-zA-Z0-9_]+$/.test(name)) {
        showError(
          "name",
          "No spaces, no special characters except underscore!"
        );
        return;
      }

      if (!email.endsWith("@stud.noroff.no")) {
        showError("email", "Only stud.noroff.no emails allowed!");
        return;
      }

      if (passwordValue !== confirmPasswordValue) {
        showError("confirmPassword", "Passwords do not match.");
        return;
      }

      try {
        const response = await fetch(
          "https://v2.api.noroff.dev/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password: passwordValue }),
          }
        );

        if (response.ok) {
          alert("Registration successful! You can now log in.");
          window.location.href = basePath + "account/login.html";
        } else {
          const errorData = await response.json();
          if (errorData.errors) {
            errorData.errors.forEach((error) => {
              if (error.message.includes("email")) {
                showError("email", "Email already in use!");
              } else {
                showError("registerError", error.message);
              }
            });
          } else {
            showError(
              "registerError",
              errorData.message || "Registration failed."
            );
          }
        }
      } catch (error) {
        console.error("Error during registration:", error);
        showError("registerError", "An error occurred. Please try again.");
      }
    });
  }
}
