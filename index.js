document.addEventListener("DOMContentLoaded", function () {
  // === 1. ĐỒNG BỘ TRẠNG THÁI ĐĂNG NHẬP TRÊN TOPBAR (BẢN CHUẨN NỀN SÁNG) ===
  function checkTopbarAuthentication() {
    const topbarLinks = document.querySelector(".topbar-links");
    if (!topbarLinks) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUsername = localStorage.getItem("current_username");

    if (isLoggedIn === "true" && currentUsername) {
      // Ép style hiển thị chữ đen, nền sáng y hệt các trang danh mục con
      topbarLinks.innerHTML = `
        <span style="color: #111111; font-weight: 600; margin-right: 5px;">Quý ông: ${currentUsername}</span>
        <span style="color: #cccccc; margin: 0 5px;">|</span>
        <a href="#" id="systemLogoutBtn" style="color: #ef4444; font-weight: 600; text-decoration: none;">Đăng xuất</a>
      `;

      const logoutBtn = document.getElementById("systemLogoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
          e.preventDefault();
          if (confirm("Bro có chắc chắn muốn đăng xuất tài khoản không?")) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("current_username");
            window.location.reload();
          }
        });
      }
    }
  }

  // === 2. LOGIC QUẢN LÝ GIỎ HÀNG DÙNG CHUNG KHỚP TRANG CON ===
  // Đọc real-time dữ liệu từ gentleman_cart để không bị lệch số lượng (4, 5 sản phẩm)
  let cart = JSON.parse(localStorage.getItem("gentleman_cart")) || [];

  const cartOverlay = document.getElementById("cartSidebarOverlay");
  const openCartBtn = document.getElementById("open-cart-btn");
  const closeCartSidebarBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalAmount = document.getElementById("cart-total-amount");
  const cartCounter = document.getElementById("cart-counter");

  // Đóng mở sidebar sử dụng class "open" y hệt trang con
  if (openCartBtn && cartOverlay) {
    openCartBtn.addEventListener("click", () =>
      cartOverlay.classList.add("open"),
    );
  }
  if (closeCartSidebarBtn && cartOverlay) {
    closeCartSidebarBtn.addEventListener("click", () =>
      cartOverlay.classList.remove("open"),
    );
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", (e) => {
      if (e.target === cartOverlay) cartOverlay.classList.remove("open");
    });
  }

  // Cập nhật giao diện giỏ hàng thời gian thực
  function updateCartUI() {
    if (cartCounter) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCounter.innerText = totalItems;
    }

    if (cartItemsContainer) {
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-msg" style="text-align:center; padding:20px; color:#888;">Giỏ hàng của quý ông đang trống.</p>`;
        if (cartTotalAmount) cartTotalAmount.innerText = "0đ";
        return;
      }

      let html = "";
      let totalMoney = 0;

      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalMoney += itemTotal;

        html += `
          <div class="cart-item-row" style="display: flex; margin-bottom: 20px; align-items: center; border-bottom: 1px dashed #eee; padding-bottom: 15px;">
            <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
            <div class="cart-item-details" style="flex: 1; position: relative;">
              <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #111; padding-right: 80px; line-height: 1.4;">${item.name}</h4>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">Size: <strong>${item.size}</strong></p>
              <div class="cart-qty-control" style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; border: 1px solid #ccc; border-radius: 3px; overflow: hidden;">
                  <button class="cart-qty-btn minus-qty" data-index="${index}" style="width: 25px; height: 25px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">-</button>
                  <input type="text" class="cart-qty-value" value="${item.quantity}" readonly style="width: 30px; height: 25px; text-align: center; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-top: none; border-bottom: none; font-size: 12px;">
                  <button class="cart-qty-btn plus-qty" data-index="${index}" style="width: 25px; height: 25px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">+</button>
                </div>
                <button class="remove-item-btn" data-index="${index}" style="color: #ff4d4d; font-size: 12px; background: none; border: none; text-decoration: underline; cursor: pointer;">Xóa khỏi giỏ</button>
              </div>
              <span class="cart-item-price" style="position: absolute; right: 0; bottom: 30px; color: #e53e3e; font-weight: 700; font-size: 14px;">${itemTotal.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        `;
      });

      cartItemsContainer.innerHTML = html;
      if (cartTotalAmount) {
        cartTotalAmount.innerText = totalMoney.toLocaleString("vi-VN") + "đ";
      }

      setupCartItemEvents();
    }
  }

  // Gán sự kiện đổi số lượng, xóa sản phẩm trực tiếp từ trang chủ
  function setupCartItemEvents() {
    cartItemsContainer.querySelectorAll(".plus-qty").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        cart[index].quantity += 1;
        saveAndRefreshCart();
      });
    });

    cartItemsContainer.querySelectorAll(".minus-qty").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          if (confirm("Bro muốn xóa sản phẩm này khỏi giỏ hàng chứ?")) {
            cart.splice(index, 1);
          }
        }
        saveAndRefreshCart();
      });
    });

    cartItemsContainer.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        if (confirm("Bro chắc chắn muốn xóa món này?")) {
          cart.splice(index, 1);
          saveAndRefreshCart();
        }
      });
    });
  }

  function saveAndRefreshCart() {
    localStorage.setItem("gentleman_cart", JSON.stringify(cart));
    updateCartUI();
  }

  // === 3. XỬ LÝ SỰ KIỆN TIẾN HÀNH THANH TOÁN ===
  function handleCheckoutRouting() {
    const checkoutBtn = document.getElementById("checkout-submit-btn");

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) {
          alert("Giỏ hàng rỗng, quý ông vui lòng lựa chọn sản phẩm trước!");
          return;
        }
        localStorage.setItem("gentleman_order_data", JSON.stringify(cart));
        window.location.href = "success.html";
      });
    }
  }

  // Chạy đồng bộ toàn bộ hệ thống lõi trên trang chủ
  checkTopbarAuthentication();
  updateCartUI();
  handleCheckoutRouting();
});
