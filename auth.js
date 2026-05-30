document.addEventListener("DOMContentLoaded", function () {
  const authBox = document.getElementById("authBox");
  const toRegister = document.getElementById("toRegister");
  const toLogin = document.getElementById("toLogin");

  // 1. Chuyển đổi qua lại giữa màn hình Đăng nhập và Đăng ký
  if (toRegister && toLogin) {
    toRegister.addEventListener("click", function (e) {
      e.preventDefault();
      authBox.classList.add("show-register");
    });

    toLogin.addEventListener("click", function (e) {
      e.preventDefault();
      authBox.classList.remove("show-register");
    });
  }

  // 2. Logic xử lý khi bấm nút ĐĂNG KÝ
  const regForm = document.getElementById("regForm");
  if (regForm) {
    regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const phone = document.getElementById("reg-phone").value.trim();
      const pass = document.getElementById("reg-pass").value.trim();
      const address = document.getElementById("reg-address").value.trim(); // Lấy dữ liệu địa chỉ

      // Kiểm tra xem người dùng có bỏ trống ô nào không
      if (!name || !phone || !pass || !address) {
        alert("Vui lòng điền đầy đủ tất cả thông tin, bao gồm cả địa chỉ!");
        return;
      }
      if (isNaN(phone)) {
        alert("Số điện thoại không hợp lệ! Vui lòng chỉ nhập số.");
        return;
      }
      if (pass.length < 6) {
        alert("Mật khẩu bảo mật phải từ 6 ký tự trở lên!");
        return;
      }

      // Tiến hành lưu thông tin đăng ký mới vào LocalStorage
      localStorage.setItem("saved_phone", phone);
      localStorage.setItem("saved_pass", pass);
      localStorage.setItem("saved_name", name);
      localStorage.setItem("saved_address", address); // Lưu địa chỉ vào bộ nhớ máy

      // Tự động đăng nhập luôn sau khi đăng ký thành công
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("current_username", name);

      alert(
        `Chúc mừng quý khách đã đăng ký thành công! Hệ thống tự động đăng nhập với tên Quý ông: ${name}`,
      );
      window.location.href = "index.html";
    });
  }

  // 3. Logic xử lý khi bấm nút ĐĂNG NHẬP
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const phoneInput = document.getElementById("login-phone").value.trim();
      const passInput = document.getElementById("login-pass").value.trim();

      if (phoneInput === "" || passInput === "") {
        alert("Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!");
        return;
      }

      const savedPhone = localStorage.getItem("saved_phone");
      const savedPass = localStorage.getItem("saved_pass");
      const savedName = localStorage.getItem("saved_name");

      // Kiểm tra tài khoản vừa đăng ký hoặc tài khoản Admin dùng thử nhanh
      if (
        (phoneInput === savedPhone && passInput === savedPass) ||
        (phoneInput === "0123456789" && passInput === "123456")
      ) {
        const userDisplayName =
          phoneInput === "0123456789" ? "Quản trị viên" : savedName;

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("current_username", userDisplayName);

        alert(
          `Đăng nhập thành công! Chào mừng quý ông ${userDisplayName} trở lại.`,
        );
        window.location.href = "index.html";
      } else {
        alert("Số điện thoại hoặc mật khẩu không chính xác!");
      }
    });
  }
});
