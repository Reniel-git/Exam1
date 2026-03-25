document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    renderCartSidebar();
    updateCartCount();
    initPaymentCard();
    initSwiper();
    initCartButtons();
    initFormValidation();
    initPaymentSubmit();
    renderFullCartPage();
    renderOrderHistory();
    loadProfile();
});

function initSwiper() {
    const swiperContainer = document.querySelector(".mySwiper");
    if (!swiperContainer) return;

    var swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        loop: false,
        speed: 800,
        slideToClickedSlide: true,
        spaceBetween: 40,
        coverflowEffect: {
            rotate: 35,
            stretch: 0,
            depth: 160,
            modifier: 1,
            slideShadows: true,
        },
        navigation: {
            nextEl: ".next",
            prevEl: ".prev",
        },
    });

    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    function updateButtons() {
        if (!prevBtn || !nextBtn) return;
        
        prevBtn.classList.remove("disabled");
        nextBtn.classList.remove("disabled");

        if (swiper.activeIndex === 0) {
            prevBtn.classList.add("disabled");
        }
        if (swiper.activeIndex === swiper.slides.length - 1) {
            nextBtn.classList.add("disabled");
        }
    }

    swiper.on("init", updateButtons);
    swiper.on("slideChange", updateButtons);
    updateButtons();
}

function updateAuthUI() {
    const loginBtn = document.querySelector(".btn-login") || document.querySelector(".btn-profile");
    if (!loginBtn) return;

    const loggedIn = isLoggedIn();
    
    if (loggedIn) {
        loginBtn.innerHTML = '<i class="fas fa-user"></i>';
        loginBtn.className = 'btn-profile';
        loginBtn.href = "user.html";
    } else {
        loginBtn.innerHTML = 'Login';
        loginBtn.className = 'btn-login';
        loginBtn.href = "login.html";
    }
}

function isLoggedIn() {
    return localStorage.getItem("loggedIn") === "true";
}

function getCart() {
    let cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const cartCounts = document.querySelectorAll(".cart-count");

    if (!isLoggedIn()) {
        cartCounts.forEach(el => el.textContent = "0");
        return; 
    }

    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    
    const displayQty = totalQty >= 99 ? "99+" : totalQty;
    
    cartCounts.forEach(el => el.textContent = displayQty);
}

function addToCart(event, name, price, image) {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    const cartIcon = document.querySelector(".cart-btn");
    const originalCard = event.target.closest('.food-card');
    
    if (originalCard && cartIcon) {
        const clone = originalCard.cloneNode(true);
        const rect = originalCard.getBoundingClientRect();
        
        clone.classList.add('flying-card-clone');
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        clone.style.top = rect.top + "px";
        clone.style.left = rect.left + "px";
        
        const btnInClone = clone.querySelector('.add-btn');
        const tagsInClone = clone.querySelectorAll('.tag');
        if (btnInClone) btnInClone.remove();
        tagsInClone.forEach(t => t.remove());

        document.body.appendChild(clone);
        
        const cartRect = cartIcon.getBoundingClientRect();
        
        setTimeout(() => {
            clone.style.top = (cartRect.top) + "px";
            clone.style.left = (cartRect.left) + "px";
            clone.style.width = "40px"; 
            clone.style.height = "40px";
            clone.style.opacity = "0.2";
        }, 10);

        setTimeout(() => {
            clone.remove();
            
            cartIcon.classList.add("cart-bounce");
            setTimeout(() => cartIcon.classList.remove("cart-bounce"), 400);

            let cart = getCart();
            let existing = cart.find(item => item.name === name);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ name, price: Number(price), image, qty: 1 });
            }
            saveCart(cart);
            updateCartCount();
            renderCartSidebar();
        }, 800);
    }
}

function renderCartSidebar() {
    const container = document.getElementById("cart-sidebar-list");
    const totalAmount = document.getElementById("sidebar-total-amount");

    if (!container) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-msg">Cart is empty</p>`;
        if(totalAmount) totalAmount.textContent = "₱0";
        return;
    }

    let html = "";
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        html += `
        <div class="cart-item">
            <img src="${item.image}" width="40">
            <div>
                <p>${item.name}</p>
                <small>₱${item.price} x ${item.qty}</small>
            </div>
        </div>`;
    });

    container.innerHTML = html;
    if(totalAmount) totalAmount.textContent = "₱" + total;
}

function initCartButtons() {
    const cartBtns = document.querySelectorAll(".cart-btn");

    cartBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); 

            if (!isLoggedIn()) {
                window.location.href = "login.html";
            } else {
                window.location.href = "cart.html";
            }
        });
    });
}

function togglePassword(inputId, icon) {
    if (inputId === "regPass" || inputId === "regConfirm" || inputId === "newPassword" || inputId === "confirmPassword") {
        let pass1 = document.getElementById(inputId === "regPass" || inputId === "regConfirm" ? "regPass" : "newPassword");
        let pass2 = document.getElementById(inputId === "regPass" || inputId === "regConfirm" ? "regConfirm" : "confirmPassword");

        let eye1 = document.getElementById(inputId === "regPass" || inputId === "regConfirm" ? "regEye" : "newEye").querySelector("i");
        let eye2 = document.getElementById(inputId === "regPass" || inputId === "regConfirm" ? "regConfirmEye" : "confirmEye").querySelector("i");

        if (pass1.type === "password") {
            pass1.type = "text";
            pass2.type = "text";
            eye1.classList.replace("fa-eye-slash", "fa-eye");
            eye2.classList.replace("fa-eye-slash", "fa-eye");
        } else {
            pass1.type = "password";
            pass2.type = "password";
            eye1.classList.replace("fa-eye", "fa-eye-slash");
            eye2.classList.replace("fa-eye", "fa-eye-slash");
        }
        return;
    }

    let input = document.getElementById(inputId);
    let iconElement = icon.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        iconElement.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        input.type = "password";
        iconElement.classList.replace("fa-eye", "fa-eye-slash");
    }
}

function toggleEyeVisibility(inputId, eyeId) {
    let input = document.getElementById(inputId);
    let eye = document.getElementById(eyeId);

    if (input.value.length > 0) {
        eye.style.display = "block";
    } else {
        eye.style.display = "none";
    }
}

function showButtonSuccess(buttonElement, successText, redirectUrl) {
    buttonElement.innerText = successText;
    buttonElement.style.background = "linear-gradient(45deg, #2ed573, #7bed9f)";
    buttonElement.style.boxShadow = "0 10px 20px rgba(46, 213, 115, 0.4)";
    buttonElement.style.pointerEvents = "none";
    setTimeout(() => { window.location.href = redirectUrl; }, 1500);
}

function registerUser() {
    let username = document.getElementById("regUser").value.trim();
    let email = document.getElementById("regEmail").value.trim().toLowerCase();
    let password = document.getElementById("regPass").value.trim();
    let confirm = document.getElementById("regConfirm").value.trim();
    let error = document.getElementById("regError");
    let btn = document.querySelector(".btn-submit");

    error.innerText = "";
    error.classList.remove("error-shake");

    if (!username || !email || !password || !confirm) { 
        error.innerText = "Please fill all fields."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }

    if (!email.endsWith("@gmail.com")) { 
        error.innerText = "Email must be a valid Gmail address."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    if (localStorage.getItem("email") === email) { 
        error.innerText = "Email is already registered."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    if (password !== confirm) { 
        error.innerText = "Passwords do not match."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }

    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,}$/;
    if (!passwordRegex.test(password)) {
        error.innerText = "Password must be at least 8 characters with uppercase, lowercase, number & special character.";
        void error.offsetWidth; error.classList.add("error-shake");
        return;
    }

    btn.innerText = "Registering...";
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    setTimeout(() => { showButtonSuccess(btn, "Registration Successful!", "login.html"); }, 1000);
}

function loginUser() {
    let email = document.getElementById("loginEmail").value.trim().toLowerCase();
    let password = document.getElementById("loginPass").value.trim();
    let error = document.getElementById("loginError");
    let btn = document.querySelector(".btn-submit");

    let savedEmail = localStorage.getItem("email");
    let savedPassword = localStorage.getItem("password");
    let savedUsername = localStorage.getItem("username");

    error.innerText = "";
    error.classList.remove("error-shake");

    if (email === "" || password === "") { 
        error.innerText = "Email and Password are required."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    if (!email.endsWith("@gmail.com")) { 
        error.innerText = "Email must be a valid Gmail address."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    if (!savedEmail || email !== savedEmail) { 
        error.innerText = "Couldn't find your Email."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    if (password !== savedPassword) { 
        error.innerText = "Incorrect password."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }

    btn.innerText = "Verifying...";
    setTimeout(() => {
        const currentUser = { username: savedUsername, email: savedEmail };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("loggedIn", "true");
        showButtonSuccess(btn, "Login Successful!", "dashboard.html");
    }, 1000);
}

function forgotPassword() { 
    let email = document.getElementById("forgotEmail").value.trim().toLowerCase();
    let error = document.getElementById("forgotError");
    let btn = document.querySelector(".btn-submit");
    let savedEmail = localStorage.getItem("email");

    error.innerText = "";
    error.classList.remove("error-shake");

    if (email === "") { 
        error.innerText = "Email is required."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    if (!email.endsWith("@gmail.com")) { 
        error.innerText = "Email must be a valid Gmail address."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    if (email !== savedEmail) { 
        error.innerText = "Email not found."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }

    btn.innerText = "Verifying Email...";
    localStorage.setItem("canReset", "true");
    setTimeout(() => { showButtonSuccess(btn, "Email Verified!", "reset.html"); }, 1200);
}

function resetPassword() { 
    if (localStorage.getItem("canReset") !== "true") { window.location.href = "forgot.html"; return; }

    let newPass = document.getElementById("newPassword").value;
    let confirmPass = document.getElementById("confirmPassword").value;
    let error = document.getElementById("resetError");
    let btn = document.querySelector(".btn-submit");

    error.innerText = "";
    error.classList.remove("error-shake");

    if (!newPass || !confirmPass) { 
        error.innerText = "Please fill both fields."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }

    if (newPass !== confirmPass) { 
        error.innerText = "Passwords do not match."; 
        void error.offsetWidth; error.classList.add("error-shake");
        return; 
    }
    
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,}$/;
    if (!passwordRegex.test(newPass)) {
        error.innerText = "Password must be at least 8 characters with uppercase, lowercase, number & special character.";
        void error.offsetWidth; error.classList.add("error-shake");
        return;
    }

    btn.innerText = "Resetting...";
    localStorage.setItem("password", newPass);
    localStorage.removeItem("canReset");
    setTimeout(() => { showButtonSuccess(btn, "Password Reset!", "login.html"); }, 1200);
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedIn");

    window.location.href = "dashboard.html";
}

function toggleEye(inputEl, iconEl) {
    if (iconEl.classList.contains('fa-eye-slash')) {
        iconEl.classList.remove('fa-eye-slash');
        iconEl.classList.add('fa-eye');
        if (inputEl.type === 'password') inputEl.type = 'text';
    } else {
        iconEl.classList.remove('fa-eye');
        iconEl.classList.add('fa-eye-slash');
        if (inputEl.id === 'input-cvv') inputEl.type = 'password';
    }
}

window.navigateWithTransition = function(url) {
    const wrapper = document.getElementById('main-wrapper');
    if (wrapper) {
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateY(20px)';
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    } else {
        window.location.href = url;
    }
};

const inputExpiry = document.getElementById('input-expiry');

    if (inputExpiry) {
        inputExpiry.addEventListener('input', (e) => {
            const val = e.target.value; 
            
            if (val) {
                const [year, month] = val.split('-');
                const shortYear = year.substring(2, 4); 
                
                displayDate.textContent = `${month}/${shortYear}`;
            } else {
                displayDate.textContent = 'MM/YY';
            }
        });
    }

function initPaymentCard() {
    const cardWrapper = document.getElementById('card-wrapper');
    if (!cardWrapper) return;

    const inputCard = document.getElementById('input-card');
    const inputName = document.getElementById('card-hold-name');
    const inputExpiry = document.getElementById('input-expiry');
    const inputCvv = document.getElementById('input-cvv');

    const displayCard = document.getElementById('card-number-display');
    const displayDate = document.getElementById('display-date');
    const displayCvv = document.getElementById('display-cvv');
    
    const eyeCard = document.getElementById('eye-card');
    const eyeCvv = document.getElementById('eye-cvv');

    const gcashInput = document.getElementById('gcash-number');
    const mpinInput = document.getElementById('input-mpin');
    
    const gcashDisplay = document.getElementById('gcash-display');
    const mpinDisplay = document.getElementById('display-mpin');
    
    const fName = document.getElementById('first-name');
    const lName = document.getElementById('last-name');
    const displayName = document.getElementById('display-name');

    function updateGcashName() {
        let nameStr = `${fName.value} ${lName.value}`.trim();
        if(displayName) displayName.textContent = nameStr.length > 0 ? nameStr.toUpperCase() : 'NAME';
    }
    if (fName && lName && gcashInput) { 
        fName.addEventListener('input', updateGcashName);
        lName.addEventListener('input', updateGcashName);
    }

    if (inputName) {
        inputName.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^a-zA-Z\s\u00d1\u00f1]/g, '');
            e.target.value = val;
            if (displayName) displayName.textContent = val.toUpperCase() || 'NAME';
        });
    }

    const toggleCardPrivacy = () => {
        const isHidden = inputCard.type === 'password';
        const targetType = isHidden ? 'text' : 'password';
        const targetIcon = isHidden ? 'fa-eye' : 'fa-eye-slash';

        inputCard.type = targetType;
        inputCvv.type = targetType;

        [eyeCard, eyeCvv].forEach(icon => {
            if (icon) icon.className = `fas ${targetIcon} icon toggle-eye`;
            if (icon) icon.style.color = isHidden ? '#ff4757' : 'rgba(255, 255, 255, 0.2)';
        });

        if (isHidden) {
            if (displayCard) displayCard.classList.remove('hide-details');
            if (displayCvv) displayCvv.classList.remove('hide-details');
        } else {
            if (displayCard) displayCard.classList.add('hide-details');
            if (displayCvv) displayCvv.classList.add('hide-details');
        }
    };

    if (eyeCard) eyeCard.onclick = toggleCardPrivacy;
    if (eyeCvv) eyeCvv.onclick = toggleCardPrivacy;

    if (inputCard) {
        inputCard.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 16);
            let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
            e.target.value = formatted;
            if (displayCard) displayCard.textContent = formatted || '**** **** **** ****';
        });
    }

    if (inputExpiry) {
        inputExpiry.addEventListener('input', (e) => {
            const val = e.target.value; 
            if (val) {
                const [year, month] = val.split('-');
                if (displayDate) displayDate.textContent = `${month}/${year.substring(2, 4)}`;
            } else {
                if (displayDate) displayDate.textContent = 'MM/YY';
            }
        });
    }

    if (inputCvv) {
        inputCvv.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 3);
            e.target.value = val;
            if (displayCvv) displayCvv.textContent = val || '***';
        });
        inputCvv.addEventListener('focus', () => cardWrapper.classList.add('flip'));
        inputCvv.addEventListener('blur', () => cardWrapper.classList.remove('flip'));
    }

    if (gcashInput) {
        gcashInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 11); 
            e.target.value = val;
            
            let formatted = val;
            if (val.length > 4) formatted = val.substring(0,4) + ' ' + val.substring(4);
            if (val.length > 7) formatted = formatted.substring(0,8) + ' ' + formatted.substring(8);
            
            if (gcashDisplay) gcashDisplay.textContent = formatted || '09** **** ***';
        });
    }

    if (mpinInput) {
        mpinInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            if (mpinDisplay) mpinDisplay.textContent = e.target.value || '****';
        });
        mpinInput.addEventListener('focus', () => cardWrapper.classList.add('flip'));
        mpinInput.addEventListener('blur', () => cardWrapper.classList.remove('flip'));
    }
}

function initPaymentSubmit() {
    const payForm = document.getElementById('pay-form');
    if (!payForm) return;

    payForm.setAttribute('novalidate', true);

    payForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const errorEl = document.getElementById('pay-error');
        const submitBtn = payForm.querySelector('.btn-submit');
        
        const phoneInput = document.getElementById('phone-number');
        const cardInput = document.getElementById('input-card');
        const cvvInput = document.getElementById('input-cvv');
        const gcashInput = document.getElementById('gcash-number');
        const mpinInput = document.getElementById('input-mpin');

        if (errorEl) {
            errorEl.innerText = "";
            errorEl.classList.remove('error-shake');
        }

        let allFilled = true;
        const requiredInputs = payForm.querySelectorAll('input[required]'); 
        
        requiredInputs.forEach(input => {
            if (input.value.trim() === "") {
                allFilled = false;
            }
        });

        if (!allFilled) {
            errorEl.innerText = "Please fill all fields.";
            void errorEl.offsetWidth; 
            errorEl.classList.add('error-shake');
            return;
        }

        if (phoneInput) {
            const phoneDigits = phoneInput.value.replace(/\D/g, ''); 
            if (phoneDigits.length !== 11) {
                errorEl.innerText = "Phone number must be exactly 11 digits.";
                void errorEl.offsetWidth; 
                errorEl.classList.add('error-shake');
                phoneInput.focus(); 
                return;
            }
        }

        if (cardInput && cvvInput) {
            const cardDigits = cardInput.value.replace(/\s/g, '');
            const cvvDigits = cvvInput.value;

            if (cardDigits.length !== 16) {
                errorEl.innerText = "Card must be 16 digits.";
                void errorEl.offsetWidth;
                errorEl.classList.add('error-shake');
                cardInput.focus();
                return;
            }

            if (cvvDigits.length !== 3) {
                errorEl.innerText = "CVV must be 3 digits.";
                void errorEl.offsetWidth;
                errorEl.classList.add('error-shake');
                cvvInput.focus();
                return; 
            }
        }

        if (gcashInput && mpinInput) {
            const gcashDigits = gcashInput.value.replace(/\D/g, '');
            const mpinDigits = mpinInput.value.replace(/\D/g, '');

            if (gcashDigits.length !== 11) {
                errorEl.innerText = "GCash number must be exactly 11 digits.";
                void errorEl.offsetWidth;
                errorEl.classList.add('error-shake');
                gcashInput.focus();
                return; 
            }

            if (mpinDigits.length !== 4) {
                errorEl.innerText = "MPIN must be exactly 4 digits.";
                void errorEl.offsetWidth;
                errorEl.classList.add('error-shake');
                mpinInput.focus();
                return;
            }
        }

        submitBtn.innerText = "Verifying...";
        submitBtn.style.pointerEvents = "none"; 
        setTimeout(() => {
            let cart = getCart();
            let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
            
            let fname = document.getElementById('first-name') ? document.getElementById('first-name').value.trim() : '';
            let lname = document.getElementById('last-name') ? document.getElementById('last-name').value.trim() : '';
            let mname = document.getElementById('middle-name') ? document.getElementById('middle-name').value.trim() : '';
            let phone = phoneInput ? phoneInput.value.trim() : '';
            let address = document.getElementById('delivery-address') ? document.getElementById('delivery-address').value.trim() : '';
            
            let fullName = `${fname} ${mname} ${lname}`.replace(/\s+/g, ' ').trim();

            let newOrder = {
                id: 'HB' + Math.floor(100000 + Math.random() * 900000),
                date: new Date().toLocaleString(),
                timestamp: Date.now(),
                items: cart,
                total: total,
                customer: { name: fullName, phone: phone, address: address },
                status: 'Preparing'
            };

            let history = JSON.parse(localStorage.getItem('orderHistory')) || [];
            history.push(newOrder);
            localStorage.setItem('orderHistory', JSON.stringify(history));

            localStorage.removeItem('cart');

            showButtonSuccess(submitBtn, "Order Successful!", "order.html");
        }, 1000);
    });
}

function renderOrderHistory() {
    const historyTable = document.getElementById("order-history-list") || document.getElementById("history-table-body");
    if (!historyTable) return; 

    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];

    if (orderHistory.length === 0) {
        historyTable.innerHTML = `<tr><td colspan="6" class="empty-history">You have no past orders. Time to get hungry!</td></tr>`;
        return;
    }

    let html = "";
    let currentTime = Date.now();

    orderHistory.slice().reverse().forEach(order => {
        let itemsSummary = order.items.map(item => `${item.qty}x ${item.name}`).join("<br>");
        
        let custName = order.customer ? order.customer.name : "N/A";
        let custPhone = order.customer ? order.customer.phone : "N/A";
        let custAddr = order.customer ? order.customer.address : "N/A";
        
        let detailsStr = `
            <span class="cust-name">${custName}</span><br>
            <span class="cust-info">${custPhone}</span><br>
            <span class="cust-info">${custAddr}</span>
        `;

        let timeElapsed = currentTime - (order.timestamp || currentTime);
        let minsElapsed = Math.floor(timeElapsed / 60000);
        
        let actionBtn = "";
        let badgeClass = "badge-preparing";
        let icon = "fa-fire";
        let displayStatus = order.status || "Preparing";

        if (displayStatus === "Refunded") {
            badgeClass = "badge-cancelled";
            icon = "fa-undo";
            actionBtn = `<button class="btn-action disabled" disabled><i class="fas fa-ban"></i> Refunded</button>`;
        } 
        else {
            let trackBtn = `<a href="track.html" class="btn-action btn-track-link"><i class="fas fa-map-marker-alt"></i> Track</a>`;

            if (minsElapsed < 10) {
                displayStatus = "Preparing";
                badgeClass = "badge-preparing";
                icon = "fa-fire";
                actionBtn = `${trackBtn} <button class="btn-action btn-refund" onclick="refundOrder('${order.id}')"><i class="fas fa-undo"></i> Refund</button>`;
            } 
            else if (minsElapsed >= 10 && minsElapsed < 30) {
                displayStatus = "Dispatched";
                badgeClass = "badge-dispatched"; 
                icon = "fa-motorcycle";
                actionBtn = `${trackBtn}`;
            } 
            else {
                displayStatus = "Delivered";
                badgeClass = "badge-delivered";
                icon = "fa-check-circle";
                actionBtn = "";
            }
        }

        html += `
        <tr>
            <td data-label="Order ID" class="order-id">${order.id}</td>
            <td data-label="Customer Details" class="order-details">${detailsStr}</td>
            <td data-label="Order Summary" class="order-items-list">${itemsSummary}</td>
            <td data-label="Total" class="order-total">₱${order.total.toLocaleString()}</td>
            <td data-label="Status"><span class="badge ${badgeClass}"><i class="fas ${icon}"></i> ${displayStatus}</span></td>
            <td data-label="Manage Order">
                <div class="action-group">
                    ${actionBtn}
                    <button class="btn-action btn-delete" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>`;
    });

    historyTable.innerHTML = html;
}

let currentDeleteId = null;

function deleteOrder(orderId) {
    currentDeleteId = orderId;
    document.getElementById("delete-modal").style.display = "flex";
    
    document.getElementById("confirm-delete-btn").onclick = function() {
        executeDelete();
    };
}

function closeDeleteModal() {
    document.getElementById("delete-modal").style.display = "none";
    currentDeleteId = null;
}

function executeDelete() {
    if (!currentDeleteId) return;

    let history = JSON.parse(localStorage.getItem("orderHistory")) || [];
    history = history.filter(o => o.id !== currentDeleteId);
    
    localStorage.setItem("orderHistory", JSON.stringify(history));
    
    closeDeleteModal();
    renderOrderHistory(); 
}

function refundOrder(orderId) {
    if(!confirm("Are you sure you want to refund this order? This cannot be undone.")) return;

    let history = JSON.parse(localStorage.getItem("orderHistory")) || [];
    
    let orderIndex = history.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        history[orderIndex].status = "Refunded";
        localStorage.setItem("orderHistory", JSON.stringify(history));
        
        renderOrderHistory(); 
    }
}

function refundOrder(orderId) {
    if(!confirm("Are you sure you want to refund this order? This cannot be undone.")) return;

    let history = JSON.parse(localStorage.getItem("orderHistory")) || [];
    
    let orderIndex = history.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        history[orderIndex].status = "Refunded";
        localStorage.setItem("orderHistory", JSON.stringify(history));
        
        renderOrderHistory(); 
    }
}

function initFormValidation() {
    const nameFields = ['first-name', 'last-name', 'middle-name', 'card-hold-name'];
    const phoneField = document.getElementById('phone-number');

    nameFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^a-zA-Z\s\u00d1\u00f1]/g, '');
                e.target.value = val;

                if (id === 'card-hold-name') {
                    const displayName = document.getElementById('display-name');
                    if (displayName) displayName.textContent = val.toUpperCase() || 'NAME';
                }
            });
        }
    });

    if (phoneField) {
        phoneField.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

function renderFullCartPage() {
    const container = document.getElementById("dynamic-cart-list");
    const totalDisplay = document.getElementById("cart-total-display");
    if (!container) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:40px; opacity:0.5; color:#fff;">Your cart is empty.</p>`;
        totalDisplay.textContent = "₱0";
        return;
    }

    let html = "";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;

        html += `
        <div class="cart-item">
            <div class="item-info">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-text"><h4>${item.name}</h4></div>
            </div>
            <div class="item-qty">
                <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                <input type="number" class="qty-input" value="${item.qty}" 
                       onchange="manualQty(${index}, this.value)">
                <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
            </div>
            <div class="item-price">₱${itemTotal.toLocaleString()}</div>
        </div>`;
    });

    container.innerHTML = html;
    totalDisplay.textContent = `₱${grandTotal.toLocaleString()}`;
}

function updateQty(index, delta) {
    let cart = getCart();
    
    if (cart[index].qty === 1 && delta === -1) {
        removeProduct(index);
    } else {
        cart[index].qty += delta;
        saveCart(cart);
        refreshAllCartViews();
    }
}

function manualQty(index, newValue) {
    let cart = getCart();
    let val = parseInt(newValue);

    if (isNaN(val) || val <= 0) {
        removeProduct(index);
    } else {
        cart[index].qty = val;
        saveCart(cart);
        refreshAllCartViews();
    }
}

function removeProduct(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    refreshAllCartViews();
}

function refreshAllCartViews() {
    renderFullCartPage();
    updateCartCount();
    renderCartSidebar();
}

let currentRefundId = null;

function refundOrder(orderId) {
    currentRefundId = orderId;
    document.getElementById("refund-modal").style.display = "flex";
    
    document.getElementById("confirm-refund-btn").onclick = function() {
        executeRefund();
    };
}

function closeRefundModal() {
    document.getElementById("refund-modal").style.display = "none";
    currentRefundId = null;
}

function executeRefund() {
    if (!currentRefundId) return;

    let history = JSON.parse(localStorage.getItem("orderHistory")) || [];
    let orderIndex = history.findIndex(o => o.id === currentRefundId);
    
    if (orderIndex !== -1) {
        history[orderIndex].status = "Refunded";
        localStorage.setItem("orderHistory", JSON.stringify(history));
        
        closeRefundModal();
        renderOrderHistory(); 
    }
}

function updateLiveTracking() {
    const stepper = document.querySelector('.tracking-stepper');
    if (!stepper) return;

    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    if (orderHistory.length === 0) return;

    let latestOrder = orderHistory[orderHistory.length - 1]; 
    
    const statusLabel = document.querySelector('.order-id');
    
    let currentTime = Date.now();
    let timeElapsed = currentTime - (latestOrder.timestamp || currentTime);
    let minsElapsed = Math.floor(timeElapsed / 60000);

    const steps = document.querySelectorAll('.step');
    
    steps.forEach(s => s.classList.remove('active', 'completed'));

    let currentStatus = "";

    if (minsElapsed < 10) {
        steps[0].classList.add('completed');
        steps[1].classList.add('active');
        currentStatus = "Preparing your food...";
    } 
    else if (minsElapsed >= 10 && minsElapsed < 30) {
        steps[0].classList.add('completed');
        steps[1].classList.add('completed');
        steps[2].classList.add('active');
        currentStatus = "Rider is on the way!";
    } 
    else {
        steps[0].classList.add('completed');
        steps[1].classList.add('completed');
        steps[2].classList.add('completed');
        steps[3].classList.add('completed');
        steps[3].classList.add('active');
        currentStatus = "Enjoy your meal!";
    }

    if(statusLabel) statusLabel.innerText = `Order ${latestOrder.id}: ${currentStatus}`;
}

if (window.location.href.includes("track.html")) {
    updateLiveTracking();
    setInterval(updateLiveTracking, 30000); 
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return; 

    const displayImg = document.getElementById("display-profile-img");
    const defaultIcon = document.getElementById("default-user-icon");
    const deleteBtn = document.getElementById("delete-pic-btn");
    const addBtn = document.getElementById("add-pic-btn");
    const errorText = document.getElementById("pic-error-text");
    const profileCircle = document.getElementById("profile-circle");

    if (profileCircle) profileCircle.classList.remove("invalid-file");
    if (errorText) errorText.style.display = "none";

    if (user.profilePic && user.profilePic !== "") {
        if (displayImg) {
            displayImg.src = user.profilePic;
            displayImg.style.display = "block";
        }
        if (defaultIcon) defaultIcon.style.display = "none";
        if (deleteBtn) deleteBtn.style.display = "flex"; 
        if (addBtn) addBtn.style.display = "none";      
    } else {
        if (displayImg) displayImg.style.display = "none";
        if (defaultIcon) defaultIcon.style.display = "block";
        if (deleteBtn) deleteBtn.style.display = "none"; 
        if (addBtn) addBtn.style.display = "flex";      
    }

    const dispUsername = document.getElementById("disp-username");
    const dispEmail = document.getElementById("disp-email");
    const dispFullname = document.getElementById("disp-fullname");
    const dispGender = document.getElementById("disp-gender");
    const dispBirthdate = document.getElementById("disp-birthdate");
    const dispPhone = document.getElementById("disp-phone");
    const dispAddress = document.getElementById("disp-address");

    if (dispUsername) dispUsername.textContent = user.username || "---";
    if (dispEmail) dispEmail.textContent = user.email || "---";
    if (dispFullname) dispFullname.textContent = user.accFullname || "---";
    if (dispGender) dispGender.textContent = user.gender || "---";
    if (dispBirthdate) dispBirthdate.textContent = user.birthdate || "---";
    if (dispPhone) dispPhone.textContent = user.phone || "---";
    if (dispAddress) dispAddress.textContent = user.address || "No address added yet. Click Edit to provide one.";

    const deleteAllBtn = document.getElementById("btn-delete-all");
    if (deleteAllBtn) {
        const hasDetails = user.accFullname || user.gender || user.birthdate || user.phone;
        const hasAddress = user.address;
        if (hasDetails || hasAddress) {
            deleteAllBtn.style.display = "block";
        } else {
            deleteAllBtn.style.display = "none";
        }
    }
}

function deleteProfilePic() {
    const confirmDelete = confirm("Are you sure you want to remove your profile picture?");
    if (!confirmDelete) return;

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
        user.profilePic = ""; 
        localStorage.setItem("currentUser", JSON.stringify(user));

        document.getElementById("display-profile-img").src = "Images/user-avatar.png";
        document.getElementById("delete-pic-btn").style.display = "none";
    }
}

const editForm = document.getElementById("editProfileForm");
const errorMsg = document.getElementById("error-message");

if (editForm) {
    editForm.setAttribute('autocomplete', 'off');

    const wipeFormToEmpty = () => {
        const inputs = editForm.querySelectorAll('input:not([type="hidden"])');
        inputs.forEach(input => {
            input.value = ""; 
            input.setAttribute('value', '');
        });

        const genderInput = document.getElementById("edit-gender");
        const genderText = document.getElementById("selected-gender-text");
        const genderIcon = document.getElementById("main-gender-icon");
        const genderGroup = document.getElementById("genderDropdown");

        if (genderInput) genderInput.value = "";
        if (genderText) genderText.innerText = "Select Gender";
        if (genderIcon) genderIcon.className = "fas fa-venus-mars icon";
        if (genderGroup) genderGroup.classList.remove("has-val");
        if (genderGroup) genderGroup.classList.remove("active");
    };

    wipeFormToEmpty();
    setTimeout(wipeFormToEmpty, 30);

    const nameInputs = ['edit-fname', 'edit-mname', 'edit-lname'];
    nameInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z\sñÑ]/g, '');
            });
        }
    });

    const phoneInput = document.getElementById('edit-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 11);
        });
    }

    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const fname = document.getElementById("edit-fname").value.trim();
        const mname = document.getElementById("edit-mname").value.trim();
        const lname = document.getElementById("edit-lname").value.trim();
        const gender = document.getElementById("edit-gender").value;
        const birthdate = document.getElementById("edit-birthdate").value;
        const phone = document.getElementById("edit-phone").value.trim();
        const address = document.getElementById("edit-address").value.trim();
        const btn = editForm.querySelector(".btn-submit");

        const showError = (message) => {
            errorMsg.textContent = message;
            errorMsg.style.visibility = "hidden";
            errorMsg.classList.remove("error-shake");
            void errorMsg.offsetWidth; 
            errorMsg.classList.add("error-shake");
        };

        if (!fname || !lname || !gender || !birthdate || !phone || !address) {
            showError("Please fill all required fields!");
            return;
        }

        if (phone.length !== 11) {
            showError("Phone number must be exactly 11 digits.");
            return;
        }

        errorMsg.style.visibility = "hidden";
        btn.innerText = "Updating...";

        setTimeout(() => {
            const user = JSON.parse(localStorage.getItem("currentUser")) || {};
            
            user.accFullname = `${fname} ${mname ? mname + ' ' : ''}${lname}`.replace(/\s+/g, ' ').trim();
            user.gender = gender;
            user.birthdate = birthdate;
            user.phone = phone;
            user.address = address;
            
            localStorage.setItem("currentUser", JSON.stringify(user));
            localStorage.setItem("username", fname);

            showButtonSuccess(btn, "Profile Updated Successfully!", "user.html");
        }, 800);
    });
}

function toggleCustomDropdown() {
    document.getElementById("genderDropdown").classList.toggle("active");
}

function selectGender(val, iconClass) {
    const input = document.getElementById("edit-gender");
    const textSpan = document.getElementById("selected-gender-text");
    const mainIcon = document.getElementById("main-gender-icon");
    const group = document.getElementById("genderDropdown");

    if (input) input.value = val;
    if (textSpan) textSpan.innerText = val;
    if (mainIcon) mainIcon.className = `fas ${iconClass} icon`;
    
    group.classList.add("has-val");
    group.classList.remove("active");
}

window.addEventListener("click", (e) => {
    const dd = document.getElementById("genderDropdown");
    if (dd && !dd.contains(e.target)) dd.classList.remove("active");

    const ap = document.getElementById("addressPicker");
    if (ap && !ap.contains(e.target)) ap.classList.remove("show");
});

function getLiveLocation() {
    const addressInput = document.getElementById('edit-address');
    
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    addressInput.value = "Getting exact location...";

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18`);
                const data = await res.json();
                
                addressInput.value = data.display_name;
                addressInput.dispatchEvent(new Event('input'));
            } catch (e) { 
                addressInput.value = `${latitude}, ${longitude}`; 
            }
        }, 
        (error) => {
            console.warn(`ERROR(${error.code}): ${error.message}`);
            addressInput.value = ""; 
            alert("Could not get an accurate location. Please ensure your device's Location/GPS is turned on.");
        }, 
        options
    );
}

function toggleAddressPicker(event) {
    event.stopPropagation();
    const picker = document.getElementById('addressPicker');
    const savedOption = document.getElementById('saved-address-option');
    
    const user = JSON.parse(localStorage.getItem("currentUser"));
    
    if (user && user.address && user.address.trim() !== "") {
        if (savedOption) savedOption.style.display = "flex";
    } else {
        if (savedOption) savedOption.style.display = "none";
    }

    if (picker) picker.classList.toggle('show');
}

async function selectAddress(type) {
    const addrInput = document.getElementById('delivery-address');
    const liveLabel = document.getElementById('live-text');
    const picker = document.getElementById('addressPicker');
    
    if (type === 'saved') {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (user && user.address) {
            addrInput.value = user.address;
            addrInput.dispatchEvent(new Event('input'));
        }
    } 
    else if (type === 'live') {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported.");
            return;
        }
        if (liveLabel) liveLabel.innerText = "Locating...";
        
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                addrInput.value = data.display_name;
                addrInput.dispatchEvent(new Event('input'));
            } catch (e) {
                addrInput.value = `${latitude}, ${longitude}`;
            } finally {
                if (liveLabel) liveLabel.innerText = "Live Location";
            }
        }, () => {
            alert("Location access denied.");
            if (liveLabel) liveLabel.innerText = "Live Location";
        });
    }

    if (picker) picker.classList.remove('show');
}


function deleteProfilePic() {
    document.getElementById("delete-pic-modal").style.display = "flex";
}

function closePicModal() {
    document.getElementById("delete-pic-modal").style.display = "none";
}

function confirmDeletePic() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
        user.profilePic = ""; 
        localStorage.setItem("currentUser", JSON.stringify(user));

        const displayImg = document.getElementById("display-profile-img");
        const defaultIcon = document.getElementById("default-user-icon");
        const deleteBtn = document.getElementById("delete-pic-btn");
        const addBtn = document.getElementById("add-pic-btn");
        
        if (displayImg) displayImg.style.display = "none";
        if (defaultIcon) defaultIcon.style.display = "block";
        if (deleteBtn) deleteBtn.style.display = "none"; 
        if (addBtn) addBtn.style.display = "flex"; 
    }
    
    closePicModal();
}

const quickUploadInput = document.getElementById('quickProfileUpload');

if (quickUploadInput) {
    quickUploadInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        
        const displayImg = document.getElementById('display-profile-img');
        const defaultIcon = document.getElementById('default-user-icon');
        const errorText = document.getElementById('pic-error-text');
        const profileCircle = document.getElementById('profile-circle');
        const addBtn = document.getElementById('add-pic-btn');
        const deleteBtn = document.getElementById('delete-pic-btn');

        if (file.type.startsWith('image/')) {
            profileCircle.classList.remove('invalid-file');
            errorText.style.display = 'none';

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;

                displayImg.src = base64Image;
                displayImg.style.display = 'block';
                defaultIcon.style.display = 'none';
                
                addBtn.style.display = 'none';   
                deleteBtn.style.display = 'flex'; 

                let user = JSON.parse(localStorage.getItem('currentUser')) || {};
                user.profilePic = base64Image;
                localStorage.setItem('currentUser', JSON.stringify(user));
            };
            
            reader.readAsDataURL(file);
        } else {
            
            profileCircle.classList.add('invalid-file');
            
            errorText.style.display = 'block';
            displayImg.style.display = 'none';
            defaultIcon.style.display = 'none';

            addBtn.style.display = 'flex';
            deleteBtn.style.display = 'none';
        }
        
        this.value = ""; 
    });
}

function openDeleteAllModal() {
    document.getElementById("delete-all-modal").style.display = "flex";
}

function closeDeleteAllModal() {
    document.getElementById("delete-all-modal").style.display = "none";
}

function executeDeleteAll() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
        user.accFullname = "";
        user.gender = "";
        user.birthdate = "";
        user.phone = "";
        user.address = "";
        
        localStorage.setItem("currentUser", JSON.stringify(user));
        loadProfile();
    }
    closeDeleteAllModal();
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const msgInput = document.getElementById('contactMessage');
    const errorEl = document.getElementById('contactError');
    const btn = document.getElementById('contactBtn');

    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z\sñÑ.]/g, '');
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase();
        });
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); 

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = msgInput.value.trim();

        const showError = (msg) => {
            errorEl.classList.remove('error-shake');
            void errorEl.offsetWidth;                
            errorEl.innerText = msg;                 
            errorEl.classList.add('error-shake');    
        };

        if (!name || !email || !message) {
            showError("Please fill all fields.");
            return;
        }

        const nameRegex = /^[a-zA-Z\sñÑ.]+$/;
        if (!nameRegex.test(name)) {
            showError("Name can only contain letters, spaces, ñ, and dots.");
            nameInput.focus();
            return;
        }

        if (!email.endsWith("@gmail.com")) {
            showError("Email must be a valid Gmail address.");
            emailInput.focus();
            return;
        }

        errorEl.innerText = ""; 
        errorEl.classList.remove('error-shake');
        
        const originalText = btn.innerText;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent!';
            btn.style.background = 'linear-gradient(45deg, #2ed573, #7bed9f)';
            btn.style.border = 'none';
            btn.style.boxShadow = '0 10px 20px rgba(46, 213, 115, 0.4)';

            const subject = encodeURIComponent(`Hungry Bar Contact: ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            
            const mailtoLink = `mailto:YOUR_EMAIL@gmail.com?subject=${subject}&body=${body}`;

            window.location.href = mailtoLink;

            contactForm.reset();
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.boxShadow = '';
                btn.style.pointerEvents = 'auto';
            }, 3000);

        }, 1500); 
    });
}

function toggleGcashVisibility() {
    const gcashInput = document.getElementById('gcash-number');
    const mpinInput = document.getElementById('input-mpin');
    const eyeGcash = document.getElementById('eye-gcash');
    const eyeMpin = document.getElementById('eye-mpin');
    
    const gcashDisplay = document.getElementById('gcash-display');
    const mpinDisplay = document.getElementById('display-mpin');

    if (!gcashInput || !mpinInput || !eyeGcash || !eyeMpin) return;

    if (gcashInput.type === 'password') {
        gcashInput.type = 'text';
        mpinInput.type = 'text';
        
        eyeGcash.classList.replace('fa-eye-slash', 'fa-eye');
        eyeGcash.style.color = '#ff4757';
        
        eyeMpin.classList.replace('fa-eye-slash', 'fa-eye');
        eyeMpin.style.color = '#ff4757';
        
        if (gcashDisplay) gcashDisplay.classList.remove('hide-details');
        if (mpinDisplay) mpinDisplay.classList.remove('hide-details');
    } 
    else {
        gcashInput.type = 'password';
        mpinInput.type = 'password';
        
        eyeGcash.classList.replace('fa-eye', 'fa-eye-slash');
        eyeGcash.style.color = 'rgba(255, 255, 255, 0.2)';
        
        eyeMpin.classList.replace('fa-eye', 'fa-eye-slash');
        eyeMpin.style.color = 'rgba(255, 255, 255, 0.2)';
        
        if (gcashDisplay) gcashDisplay.classList.add('hide-details');
        if (mpinDisplay) mpinDisplay.classList.add('hide-details');
    }
}

window.toggleGcashVisibility = toggleGcashVisibility;

function togglePassword(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let displayEl = null;
    if (inputId === 'input-card') displayEl = document.getElementById('card-number-display');
    if (inputId === 'input-cvv') displayEl = document.getElementById('display-cvv');

    if (input.type === 'password') {
        input.type = 'text';
        iconElement.classList.replace('fa-eye-slash', 'fa-eye');
        iconElement.style.color = '#ff4757';
        if (displayEl) displayEl.classList.remove('hide-details');
    } else {
        input.type = 'password';
        iconElement.classList.replace('fa-eye', 'fa-eye-slash');
        iconElement.style.color = 'rgba(255, 255, 255, 0.2)';
        if (displayEl) displayEl.classList.add('hide-details');
    }
}

window.togglePassword = togglePassword;

function showButtonSuccess(buttonElement, successText, redirectUrl) {
    buttonElement.innerText = successText;
    buttonElement.style.setProperty("background", "linear-gradient(45deg, #2ed573, #7bed9f)", "important");
    buttonElement.style.boxShadow = "0 10px 20px rgba(46, 213, 115, 0.4)";
    buttonElement.style.pointerEvents = "none";
    setTimeout(() => { window.location.href = redirectUrl; }, 1500);
}

function openLogoutModal() {
    document.getElementById("logout-modal").style.display = "flex";
}

function closeLogoutModal() {
    document.getElementById("logout-modal").style.display = "none";
}