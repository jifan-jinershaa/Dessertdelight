(function () {
    'use strict';

    // =====================================================
    // DESSERT DELIGHT AUTHENTICATION SYSTEM
    // =====================================================

    const TOKEN_KEY = 'dessertDelightToken';
    const USER_KEY = 'dessertDelightUser';


    // =====================================================
    // GET TOKEN
    // =====================================================

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }


    // =====================================================
    // GET USER
    // =====================================================

    function getUser() {
        const storedUser =
            localStorage.getItem(USER_KEY);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    }


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    function isLoggedIn() {
        return Boolean(getToken());
    }


    // =====================================================
    // SAVE LOGIN
    // =====================================================

    function saveLogin(token, user) {

        localStorage.setItem(
            TOKEN_KEY,
            token
        );

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function logout() {

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);

        window.location.replace('/login.html');
    }


    // =====================================================
    // CURRENT PAGE
    // =====================================================

    const currentPage =
        window.location.pathname
            .split('/')
            .pop()
            .toLowerCase();


    // =====================================================
    // PUBLIC PAGES
    // =====================================================

    const publicPages = [
        '',
        'login.html',
        'register.html'
    ];


    // =====================================================
    // PROTECT WEBSITE
    // =====================================================

    if (
        !publicPages.includes(currentPage) &&
        !isLoggedIn()
    ) {
        window.location.replace('/login.html');
        return;
    }


    // =====================================================
    // LOGGED-IN USER VISITS LOGIN
    // =====================================================

    if (
        currentPage === 'login.html' &&
        isLoggedIn()
    ) {
        window.location.replace('/index.html');
        return;
    }


    // =====================================================
    // GLOBAL AUTH OBJECT
    // =====================================================

    window.dessertDelightAuth = {
        getToken,
        getUser,
        isLoggedIn,
        saveLogin,
        logout
    };


    window.logoutDessertDelight = logout;


    // =====================================================
    // CREATE TOP-RIGHT ACCOUNT UI
    // =====================================================

    document.addEventListener(
        'DOMContentLoaded',
        function () {

            if (!isLoggedIn()) {
                return;
            }

            createAccountUI();

        }
    );


    // =====================================================
    // ACCOUNT UI
    // =====================================================

    function createAccountUI() {

        const user = getUser();

        if (!user) {
            return;
        }


        // Remove old login links

        document
            .querySelectorAll(
                'a[href="login.html"], a[href="/login.html"]'
            )
            .forEach(function (link) {

                link.remove();

            });


        // Prevent duplicate account menu

        if (
            document.getElementById(
                'dessert-account'
            )
        ) {
            return;
        }


        // Find navigation

        const nav =
            document.querySelector(
                'nav'
            );


        if (!nav) {
            return;
        }


        // Create account container

        const account =
            document.createElement(
                'div'
            );


        account.id =
            'dessert-account';


        account.innerHTML = `

            <button
                type="button"
                class="dessert-account-button"
                id="dessertAccountButton"
            >

                <span class="dessert-avatar">
                    ${getInitials(user.name)}
                </span>

                <span class="dessert-user-name">
                    ${escapeHtml(user.name)}
                </span>

                <span class="dessert-arrow">
                    ▾
                </span>

            </button>


            <div
                class="dessert-account-menu"
                id="dessertAccountMenu"
            >

                <div class="dessert-account-header">

                    <div class="dessert-large-avatar">
                        ${getInitials(user.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(user.name)}
                        </strong>

                        <small>
                            ${escapeHtml(user.email)}
                        </small>

                    </div>

                </div>


                <div class="dessert-menu-divider"></div>


                <a
                    href="profile.html"
                    class="dessert-menu-item"
                >
                    <span>👤</span>
                    <span>My Profile</span>
                </a>


                <a
                    href="personalization.html"
                    class="dessert-menu-item"
                >
                    <span>⚙</span>
                    <span>Personalization</span>
                </a>


                <a
                    href="register.html"
                    class="dessert-menu-item"
                >
                    <span>＋</span>
                    <span>Add Account</span>
                </a>


                <div class="dessert-menu-divider"></div>


                <button
                    type="button"
                    class="dessert-menu-item dessert-logout"
                    id="dessertLogout"
                >
                    <span>↪</span>
                    <span>Log Out</span>
                </button>

            </div>

        `;


        nav.appendChild(account);


        // =================================================
        // BUTTON
        // =================================================

        const accountButton =
            document.getElementById(
                'dessertAccountButton'
            );


        const accountMenu =
            document.getElementById(
                'dessertAccountMenu'
            );


        accountButton.addEventListener(
            'click',
            function (event) {

                event.stopPropagation();

                accountMenu.classList.toggle(
                    'show'
                );

            }
        );


        // =================================================
        // LOGOUT
        // =================================================

        document
            .getElementById(
                'dessertLogout'
            )
            .addEventListener(
                'click',
                function () {

                    logout();

                }
            );


        // =================================================
        // CLICK OUTSIDE
        // =================================================

        document.addEventListener(
            'click',
            function (event) {

                if (
                    !account.contains(event.target)
                ) {

                    accountMenu.classList.remove(
                        'show'
                    );

                }

            }
        );

    }


    // =====================================================
    // INITIALS
    // =====================================================

    function getInitials(name) {

        if (!name) {
            return 'U';
        }


        const words =
            name
                .trim()
                .split(/\s+/);


        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(value) {

        const element =
            document.createElement(
                'div'
            );

        element.textContent =
            value || '';

        return element.innerHTML;

    }


})();