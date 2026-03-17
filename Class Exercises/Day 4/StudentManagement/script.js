    let users = [
      { username: "student", password: "1234" }
    ];

    function showLogin() {
      document.getElementById("loginForm").style.display = "block";
      document.getElementById("registerForm").style.display = "none";
    }

    function showRegister() {
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("registerForm").style.display = "block";
    }

    function register() {
      let user = document.getElementById("regUser").value;
      let pass = document.getElementById("regPass").value;

      if (user === "" || pass === "") {
        alert("Please fill all fields");
        return;
      }
      users.push({ username: user, password: pass });
      alert("Registered Successfully");
      showLogin();
    }

    function login() {
      let user = document.getElementById("loginUser").value;
      let pass = document.getElementById("loginPass").value;

      let valid = false;

      for (let i = 0; i < users.length; i++) {
        if (users[i].username === user && users[i].password === pass) {
          valid = true;
          break;
        }
      }

      if (valid) {
        alert("Login Successful");
        window.location.href = "welcome.html";
      } else {
        alert("Invalid Username or Password");
      }
    }
