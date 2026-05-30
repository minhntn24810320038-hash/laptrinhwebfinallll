document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // 1. ĐỒNG BỘ TRẠNG THÁI ĐĂNG NHẬP
  // ==========================================
  function checkTopbarAuthentication() {
    const topbarLinks = document.querySelector(".topbar-links");
    if (!topbarLinks) return;

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUsername = localStorage.getItem("current_username");

    if (isLoggedIn === "true" && currentUsername) {
      topbarLinks.innerHTML = `
        <span style="color: #ffffff; font-weight: 500; margin-right: 5px;">Quý ông: ${currentUsername}</span>
        <span style="color: #444444; margin: 0 5px;">|</span>
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

  // ==========================================
  // 2. KHỞI TẠO BIẾN GIỎ HÀNG TOÀN CỤC (LOCALSTORAGE)
  // ==========================================
  let cart = JSON.parse(localStorage.getItem("gentleman_cart")) || [];

  const cartOverlay = document.getElementById("cartSidebarOverlay");
  const openCartBtn = document.getElementById("open-cart-btn");
  const closeCartSidebarBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalAmount = document.getElementById("cart-total-amount");
  const cartCounter = document.getElementById("cart-counter");

  // ==========================================
  // 3. LOGIC ĐÓNG / MỞ SIDEBAR GIỎ HÀNG
  // ==========================================
  if (openCartBtn && cartOverlay) {
    openCartBtn.addEventListener("click", () => {
      cartOverlay.classList.add("open");
    });
  }
  if (closeCartSidebarBtn && cartOverlay) {
    closeCartSidebarBtn.addEventListener("click", () => {
      cartOverlay.classList.remove("open");
    });
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", (e) => {
      if (e.target === cartOverlay) cartOverlay.classList.remove("open");
    });
  }

  // ==========================================
  // 4. HÀM CẬP NHẬT GIAO DIỆN GIỎ HÀNG THỜI GIAN THỰC
  // ==========================================
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
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">Kích cỡ: <strong>${item.size}</strong></p>
              <div class="cart-qty-control" style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; border: 1px solid #ccc; border-radius: 3px; overflow: hidden;">
                  <button class="cart-qty-btn minus-qty" data-index="${index}" style="width: 25px; height: 25px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">-</button>
                  <input type="text" class="cart-qty-value" value="${item.quantity}" readonly style="width: 30px; height: 25px; text-align: center; border-left: 1px solid #ccc; border-right: 1px solid #ccc; border-top: none; border-bottom: none; font-size: 12px;">
                  <button class="cart-qty-btn plus-qty" data-index="${index}" style="width: 25px; height: 25px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">+</button>
                </div>
                <button class="remove-item-btn" data-index="${index}" style="color: #ff4d4d; font-size: 12px; background: none; border: none; text-decoration: underline; cursor: pointer;">Xóa món này</button>
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

  function setupCartItemEvents() {
    cartItemsContainer.querySelectorAll(".plus-qty").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const index = this.getAttribute("data-index");
        cart[index].quantity += 1;
        saveAndRefreshCart();
      });
    });

    cartItemsContainer.querySelectorAll(".minus-qty").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const index = this.getAttribute("data-index");
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          if (confirm("Bro muốn bỏ sản phẩm này ra khỏi giỏ chứ?")) {
            cart.splice(index, 1);
          }
        }
        saveAndRefreshCart();
      });
    });

    cartItemsContainer.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const index = this.getAttribute("data-index");
        if (confirm("Bro có chắc chắn muốn bỏ món này?")) {
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

  // ==========================================
  // 5. LOGIC TÍNH SIZE TỰ ĐỘNG CHUẨN XÁC (TỐI GIẢN)
  // ==========================================
  // ==========================================
  // 5. LOGIC TÍNH SIZE TỰ ĐỘNG CHUẨN XÁC (HỆ CHỮ ĐỒNG BỘ)
  // ==========================================
  const calculateBtn = document.getElementById("calculate-size-btn");
  const initialStatus = document.getElementById("initial-status");
  const realResults = document.getElementById("real-results");

  const shirtSizeRes = document.getElementById("shirt-size-res");
  const pantsSizeRes = document.getElementById("pants-size-res");
  const analysisNoteText = document.getElementById("analysis-note-text");

  if (calculateBtn) {
    calculateBtn.addEventListener("click", function () {
      const height = parseFloat(document.getElementById("calc-height").value);
      const weight = parseFloat(document.getElementById("calc-weight").value);

      if (!height || !weight || height <= 0 || weight <= 0) {
        alert(
          "Quý ông vui lòng điền đầy đủ và chính xác Chiều cao và Cân nặng!",
        );
        return;
      }

      // Thuật toán gộp chung hệ chữ (S, M, L, XL, XXL) dựa trên thể trạng nam giới
      let commonSize = "M";
      if (weight < 55) {
        commonSize = "S";
      } else if (weight >= 55 && weight <= 64) {
        commonSize = "M";
      } else if (weight >= 65 && weight <= 74) {
        commonSize = "L";
      } else if (weight >= 75 && weight <= 84) {
        commonSize = "XL";
      } else {
        commonSize = "XXL";
      }

      // Tính toán chỉ số BMI để đưa ra lời khuyên phù hợp
      const bmi = weight / ((height / 100) * (height / 100));
      let fitNote = "";

      if (bmi < 18.5) {
        fitNote = `💡 Thể hình hơi mảnh khảnh (BMI: ${bmi.toFixed(1)}). Khuyên dùng size ${commonSize} để ôm vừa vặn cấu trúc cơ thể, tránh mặc quá rộng.`;
      } else if (bmi >= 18.5 && bmi <= 24.9) {
        fitNote = `💡 Chỉ số cơ thể của quý ông cực kỳ cân đối (BMI: ${bmi.toFixed(1)}). Kích cỡ ${commonSize} sẽ tôn dáng Slim-fit chuẩn mực và sang trọng nhất.`;
      } else {
        fitNote = `💡 Thể hình quý ông hơi đậm người (BMI: ${bmi.toFixed(1)}). Lựa chọn size ${commonSize} giúp bảo đảm sự thoải mái tối đa khi vận động liên tục.`;
      }

      // Cập nhật kết quả lên giao diện
      if (initialStatus) initialStatus.style.display = "none";
      if (realResults) realResults.style.display = "block";

      if (shirtSizeRes) shirtSizeRes.innerText = commonSize;
      if (pantsSizeRes) pantsSizeRes.innerText = commonSize;
      if (analysisNoteText) analysisNoteText.innerText = fitNote;
    });
  }
  // ==========================================
  // 6. XỬ LÝ THANH TOÁN ĐỒNG BỘ (RESET GIỎ HÀNG)
  // ==========================================
  function handleCheckoutRouting() {
    const checkoutBtn = document.getElementById("checkout-submit-btn");

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) {
          alert("Giỏ hàng chưa có gì, quý ông hãy lựa chọn sản phẩm trước!");
          return;
        }

        // 1. Lưu thông tin đơn hàng sang bộ nhớ tạm
        localStorage.setItem("gentleman_order_data", JSON.stringify(cart));

        // 2. XÓA SẠCH GIỎ HÀNG HIỆN TẠI
        cart = [];
        localStorage.removeItem("gentleman_cart");

        // 3. Cập nhật lại giao diện ngay lập tức
        updateCartUI();

        // 4. Chuyển hướng quý ông đến trang hoàn tất thanh toán
        window.location.href = "success.html";
      });
    }
  }

  // KHỞI CHẠY TRANG TƯ VẤN
  checkTopbarAuthentication();
  updateCartUI();
  handleCheckoutRouting();
});
