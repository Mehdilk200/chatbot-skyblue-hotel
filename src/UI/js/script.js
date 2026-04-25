function goLogin() {
  window.location.href = "login.html";
}

function goSignup() {
  window.location.href = "signup.html";
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const data = await apiService.login(email, password);
    alert("Login successful!");
    
    // Check if the user is an admin
    if (data.user && data.user.role === 'admin') {
      window.location.href = "room-add.html";
    } else {
      window.location.href = "index.html";
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

async function signup() {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill in all required fields (First Name, Last Name, Email, Password)");
    return;
  }

  const userData = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    password: password
  };

  try {
    await apiService.signup(userData);
    alert("Signup successful!");
    window.location.href = "login.html";
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
}
