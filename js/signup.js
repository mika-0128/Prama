import {
  auth,
  googleProvider
} from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const fullNameInput =
  document.getElementById("fullName");

  const emailInput =
  document.getElementById("email");

  const passwordInput =
  document.getElementById("password");

  const togglePassword =
  document.getElementById("togglePassword");

  const signupBtn =
  document.getElementById("signupBtn");

  const googleBtn =
  document.getElementById("googleBtn");

  if(fullNameInput) fullNameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";

  togglePassword.addEventListener("click", () => {

    if(passwordInput.type === "password"){

      passwordInput.type = "text";

      togglePassword.innerHTML =
      '<i class="fa-regular fa-eye-slash"></i>';

    }else{

      passwordInput.type = "password";

      togglePassword.innerHTML =
      '<i class="fa-regular fa-eye"></i>';

    }

  });

  signupBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const fullName =
    fullNameInput ? fullNameInput.value.trim() : "";

    const email =
    emailInput.value.trim();

    const password =
    passwordInput.value.trim();

    if(!fullName || !email || !password){

      alert("Please fill all fields");
      return;

    }

    if(password.length < 6){

      alert("Password should be at least 6 characters");
      return;

    }

    try{

      const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(
        userCredential.user,
        {
          displayName: fullName
        }
      );

      console.log(
        "Signed up user:",
        userCredential.user
      );

      window.location.href =
      "welcome.html";

    }catch(error){

      console.error(
        "Signup error:",
        error
      );

      if(error.code === "auth/email-already-in-use"){

        alert("This email already has an account. Please log in.");

      }else if(error.code === "auth/invalid-email"){

        alert("Invalid email format.");

      }else if(error.code === "auth/weak-password"){

        alert("Password is too weak. Use at least 6 characters.");

      }else{

        alert("Sign up failed: " + error.message);

      }

    }

  });

  if(googleBtn){

    googleBtn.addEventListener("click", async (e) => {

      e.preventDefault();

      try{

        const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

        console.log(
          "Google signup user:",
          result.user
        );

        window.location.href =
        "welcome.html";

      }catch(error){

        console.error(
          "Google signup error:",
          error
        );

        if(error.code === "auth/popup-closed-by-user"){

          console.log("Google popup closed");

        }else if(error.code === "auth/network-request-failed"){

          alert("Network error. Check your internet connection.");

        }else if(error.code === "auth/operation-not-allowed"){

          alert("Google Sign-In is not enabled in Firebase.");

        }else{

          alert("Google Sign-Up failed: " + error.message);

        }

      }

    });

  }

});

const confirmPasswordInput =
document.getElementById("confirmPassword");

const toggleConfirmPassword =
document.getElementById("toggleConfirmPassword");

toggleConfirmPassword.addEventListener("click", () => {

  if(confirmPasswordInput.type === "password"){

    confirmPasswordInput.type = "text";

    toggleConfirmPassword.innerHTML =
    '<i class="fa-regular fa-eye-slash"></i>';

  }else{

    confirmPasswordInput.type = "password";

    toggleConfirmPassword.innerHTML =
    '<i class="fa-regular fa-eye"></i>';

  }

});