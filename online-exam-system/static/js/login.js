/**
 * Part 9: Login Client-Side Validation and Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    const emailFeedback = document.getElementById('emailFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');

    // 1. Password Visibility Toggle
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            
            if (isPassword) {
                togglePasswordIcon.classList.remove('bi-eye');
                togglePasswordIcon.classList.add('bi-eye-slash');
            } else {
                togglePasswordIcon.classList.remove('bi-eye-slash');
                togglePasswordIcon.classList.add('bi-eye');
            }
        });
    }

    // 2. Client-side Form Validation
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            let isValid = true;
            const emailValue = emailInput.value.trim();
            const passwordValue = passwordInput.value.trim();

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailValue) {
                emailInput.classList.add('is-invalid');
                emailFeedback.textContent = 'Email field cannot be empty.';
                isValid = false;
            } else if (!emailRegex.test(emailValue)) {
                emailInput.classList.add('is-invalid');
                emailFeedback.textContent = 'Please enter a valid email address.';
                isValid = false;
            } else {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid');
            }

            // Password validation
            if (!passwordValue) {
                passwordInput.classList.add('is-invalid');
                passwordFeedback.textContent = 'Password field cannot be empty.';
                isValid = false;
            } else {
                passwordInput.classList.remove('is-invalid');
                passwordInput.classList.add('is-valid');
            }

            if (!isValid) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        // Clear validation on typing
        emailInput.addEventListener('input', () => {
            emailInput.classList.remove('is-invalid');
        });
        passwordInput.addEventListener('input', () => {
            passwordInput.classList.remove('is-invalid');
        });
    }
});
