// ========== script.js ==========
(function() {
    // DOM элементы
    const modalOverlay = document.getElementById('authModal');
    const userIcon = document.querySelector('.nav_item_user');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Контейнеры форм
    const loginContainer = document.getElementById('loginFormContainer');
    const registerContainer = document.getElementById('registerFormContainer');
    
    // Кнопки переключения
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    
    // Формы
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Элементы полей
    const regNameInput = document.getElementById('regName');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');
    const acceptTermsCheck = document.getElementById('acceptTerms');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    // Открыть модальное окно (всегда показываем форму входа)
    function openModal() {
        showLoginForm();
        if (window.matchMedia('(max-width: 768px)').matches) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            modalOverlay.scrollTop = 0;
        }
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Показать форму входа, скрыть регистрацию
    function showLoginForm() {
        loginContainer.classList.remove('hidden-form');
        registerContainer.classList.add('hidden-form');
        loginContainer.classList.add('fade-in');
        setTimeout(() => loginContainer.classList.remove('fade-in'), 250);
    }
    
    // Показать форму регистрации
    function showRegisterForm() {
        registerContainer.classList.remove('hidden-form');
        loginContainer.classList.add('hidden-form');
        registerContainer.classList.add('fade-in');
        setTimeout(() => registerContainer.classList.remove('fade-in'), 250);
    }
    
    function validateEmail(email) {
        return email.includes('@') && email.includes('.');
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        const remember = document.getElementById('rememberMe').checked;

        if (!email) {
            alert('Введите адрес электронной почты');
            return;
        }
        if (!password) {
            alert('Введите пароль');
            return;
        }
        if (!validateEmail(email)) {
            alert('Введите корректный email (пример: name@domain.com)');
            return;
        }
        if (window.AdminAuth && AdminAuth.isAdminCredentials(email, password)) {
            AdminAuth.login({ remember });
            closeModal();
            AdminAuth.goToAdmin();
            return;
        }

        if (!window.AuthService) {
            alert('Сервис авторизации не загружен');
            return;
        }

        try {
            await AuthService.login({ email, password, remember });
            closeModal();
            AuthService.goToAccount();
        } catch (err) {
            alert(err.message || 'Не удалось войти');
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const fullName = regNameInput.value.trim();
        const email = regEmailInput.value.trim();
        const password = regPasswordInput.value.trim();
        const termsAccepted = acceptTermsCheck.checked;

        if (!fullName) {
            alert('Пожалуйста, укажите ФИО');
            return;
        }
        if (!email) {
            alert('Введите адрес электронной почты');
            return;
        }
        if (!validateEmail(email)) {
            alert('Введите корректный email (например, name@domain.com)');
            return;
        }
        if (!password) {
            alert('Придумайте пароль');
            return;
        }
        if (password.length < 4) {
            alert('Пароль должен содержать минимум 4 символа');
            return;
        }
        if (!termsAccepted) {
            alert('Необходимо принять условия соглашения');
            return;
        }
        if (!window.AuthService) {
            alert('Сервис авторизации не загружен');
            return;
        }

        try {
            await AuthService.register({ fullName, email, password });
            closeModal();
            AuthService.goToAccount();
        } catch (err) {
            alert(err.message || 'Не удалось зарегистрироваться');
        }
        regPasswordInput.value = '';
    }
    
    // Забыли пароль (демо)
    function handleForgotPassword(e) {
        e.preventDefault();
        alert('🔐 Функция восстановления пароля.\nСвяжитесь с поддержкой или проверьте почту (демо-режим).');
    }
    
    // Закрытие по клику на оверлей
    function onOverlayClick(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    }
    
    // Закрытие по ESC
    function onKeyDown(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    }
    
    // Назначение обработчиков
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', showRegisterForm);
    }
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', showLoginForm);
    }
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', handleForgotPassword);
    }
    
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', onOverlayClick);
    document.addEventListener('keydown', onKeyDown);
    
    function onUserIconClick(e) {
        e.preventDefault();
        if (window.AdminAuth && AdminAuth.isLoggedIn()) {
            AdminAuth.goToAdmin();
            return;
        }
        if (window.AuthService && AuthService.isLoggedIn()) {
            AuthService.goToAccount();
            return;
        }
        openModal();
    }

    if (userIcon) {
        userIcon.addEventListener('click', onUserIconClick);
    }

    const authQuery = new URLSearchParams(window.location.search).get('auth');
    if (authQuery === 'login' && modalOverlay) {
        openModal();
    }
    
    // Если бургер-меню открыто, закрываем его при клике на пользователя
    const burgerCheckbox = document.getElementById('burger_menu');
    if (userIcon && burgerCheckbox) {
        userIcon.addEventListener('click', () => {
            if (burgerCheckbox.checked) {
                burgerCheckbox.checked = false;
            }
        });
    }
    if (burgerCheckbox) {
        document.querySelectorAll('.burger_drawer .burger_link').forEach((link) => {
            link.addEventListener('click', () => {
                burgerCheckbox.checked = false;
            });
        });
    }
    
    // Инициализация: поля пароля пустые, чекбокс соглашения снят
    loginPassword.value = '';
    regPasswordInput.value = '';
    acceptTermsCheck.checked = false;

    // Фиксированное меню: компенсируем высоту шапки, чтобы контент не уходил под неё
    const menuBar = document.querySelector('.menu_bar');
    function syncBodyPaddingTop() {
        if (!menuBar) return;
        const h = menuBar.offsetHeight || 0;
        document.body.style.paddingTop = h ? `${h}px` : '';
        document.documentElement.style.setProperty('--menu-bar-height', h ? `${h}px` : '0px');
    }
    window.addEventListener('load', syncBodyPaddingTop);
    window.addEventListener('resize', syncBodyPaddingTop);
    syncBodyPaddingTop();
})();