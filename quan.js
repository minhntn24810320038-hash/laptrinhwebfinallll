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
  // 2. KHỞI TẠO BIẾN & DANH SÁCH SIZE CHỮ (S, M, L, XL, XXL)
  // ==========================================
  let cart = JSON.parse(localStorage.getItem("gentleman_cart")) || [];
  const trouserSizes = ["S", "M", "L", "XL", "XXL"];

  let currentProduct = {};
  let selectedSize = "";

  // DOM Elements - Giỏ hàng
  const cartOverlay = document.getElementById("cartSidebarOverlay");
  const openCartBtn = document.getElementById("open-cart-btn");
  const closeCartSidebarBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalAmount = document.getElementById("cart-total-amount");
  const cartCounter = document.getElementById("cart-counter");

  // DOM Elements - Modal Chi tiết & Chọn Size
  const productModal = document.getElementById("productPopupModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalImg = document.getElementById("modal-product-img");
  const modalName = document.getElementById("modal-product-name");
  const modalCode = document.getElementById("modal-product-code");
  const modalPrice = document.getElementById("modal-product-price");
  const sizeContainer = document.getElementById("size-container");

  // DOM Elements - Bộ đếm số lượng
  const qMinus = document.getElementById("q-minus");
  const qPlus = document.getElementById("q-plus");
  const qVal = document.getElementById("q-val");

  // DOM Elements - Nút hành động
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const buyNowBtn = document.getElementById("buy-now-btn");

  // ==========================================
  // 3. LOGIC ĐÓNG / MỞ SIDEBAR GIỎ HÀNG
  // ==========================================
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
          if (confirm("Bro muốn xóa sản phẩm này khỏi giỏ hàng chứ?")) {
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

  // ==========================================
  // 5. MỞ POPUP KHI CLICK VÀO CARD SẢN PHẨM
  // ==========================================
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", function () {
      currentProduct = {
        id: this.getAttribute("data-id") || "Q0",
        name:
          this.getAttribute("data-name") || this.querySelector("h3").innerText,
        price: parseInt(this.getAttribute("data-price")) || 0,
        img: this.getAttribute("data-img") || this.querySelector("img").src,
        code: this.getAttribute("data-code") || "Q-00",
      };

      selectedSize = "";
      if (qVal) qVal.value = "1";

      if (modalImg) modalImg.src = currentProduct.img;
      if (modalName) modalName.innerText = currentProduct.name;
      if (modalCode) modalCode.innerText = currentProduct.code;
      if (modalPrice)
        modalPrice.innerText =
          currentProduct.price.toLocaleString("vi-VN") + "đ";

      if (sizeContainer) {
        sizeContainer.innerHTML = trouserSizes
          .map(
            (size) =>
              `<button class="size-btn" data-size="${size}">${size}</button>`,
          )
          .join("");

        const sizeButtons = sizeContainer.querySelectorAll(".size-btn");
        sizeButtons.forEach((btn) => {
          btn.addEventListener("click", function (e) {
            e.stopPropagation();
            sizeButtons.forEach((b) => b.classList.remove("selected"));
            this.classList.add("selected");
            selectedSize = this.getAttribute("data-size");
          });
        });
      }

      if (productModal) productModal.classList.add("active");
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      productModal.classList.remove("active");
    });
  }
  if (productModal) {
    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) productModal.classList.remove("active");
    });
  }

  const modalContent = document.querySelector(".modal-content");
  if (modalContent) {
    modalContent.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (qPlus && qVal) {
    qPlus.addEventListener("click", (e) => {
      e.stopPropagation();
      qVal.value = parseInt(qVal.value) + 1;
    });
  }
  if (qMinus && qVal) {
    qMinus.addEventListener("click", (e) => {
      e.stopPropagation();
      let currentVal = parseInt(qVal.value);
      if (currentVal > 1) qVal.value = currentVal - 1;
    });
  }

  // ==========================================
  // 6. XỬ LÝ LƯU SẢN PHẨM VÀO GIỎ HÀNG CHUNG
  // ==========================================
  function executeAddingProduct() {
    if (!selectedSize) {
      alert("Quý ông vui lòng chọn Kích cỡ (Size) trước khi mua hàng!");
      return false;
    }

    const quantityToAdd = parseInt(qVal.value) || 1;

    const productFinal = {
      id: `${currentProduct.id}-${selectedSize}`,
      name: currentProduct.name,
      price: currentProduct.price,
      img: currentProduct.img,
      size: selectedSize,
      quantity: quantityToAdd,
    };

    const existingIndex = cart.findIndex(
      (item) =>
        item.name === productFinal.name && item.size === productFinal.size,
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantityToAdd;
    } else {
      cart.push(productFinal);
    }

    saveAndRefreshCart();
    productModal.classList.remove("active");
    return true;
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const success = executeAddingProduct();
      if (success && cartOverlay) cartOverlay.classList.add("open");
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const success = executeAddingProduct();
      if (success && cartOverlay) cartOverlay.classList.add("open");
    });
  }

  // ==========================================
  // 7. XỬ LÝ ĐIỀU HƯỚNG THANH TOÁN ĐỒNG BỘ
  // ==========================================
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

  // KÍCH HOẠT HỆ THỐNG LÕI TRÊN TRANG
  checkTopbarAuthentication();
  updateCartUI();
  handleCheckoutRouting();
});
