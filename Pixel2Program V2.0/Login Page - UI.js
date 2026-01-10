// n8n Code Node: Login Page UI
// UPDATED VERSION - POST with draft_id, receive Customer Input HTML response

var loginHtml = '<!DOCTYPE html>' +
  '<html lang="en">' +
  '<head>' +
  '  <meta charset="UTF-8">' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '  <title>Login - Danfoss ALADIN</title>' +
  '  <style>' +
  '    * { margin: 0; padding: 0; box-sizing: border-box; }' +
  '    body {' +
  '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
  '      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' +
  '      min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;' +
  '    }' +
  '    .login-container {' +
  '      background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);' +
  '      padding: 40px; width: 100%; max-width: 420px; animation: slideIn 0.5s ease-out;' +
  '    }' +
  '    @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }' +
  '    .branding { text-align: center; margin-bottom: 30px; }' +
  '    .branding h1 {' +
  '      font-size: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' +
  '      -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;' +
  '    }' +
  '    .branding .subtitle { color: #6b7280; font-size: 14px; }' +
  '    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent); margin: 25px 0; }' +
  '    .form-group { margin-bottom: 20px; }' +
  '    label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }' +
  '    input[type="text"], input[type="password"] {' +
  '      width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;' +
  '      font-size: 15px; transition: all 0.3s ease; outline: none;' +
  '    }' +
  '    input[type="text"]:focus, input[type="password"]:focus { border-color: #667eea; box-shadow: 0 0 0 4px rgba(102,126,234,0.1); }' +
  '    input.error { border-color: #ef4444; animation: shake 0.4s ease; }' +
  '    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }' +
  '    .btn-login {' +
  '      width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' +
  '      color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600;' +
  '      cursor: pointer; transition: all 0.3s ease; margin-top: 10px;' +
  '    }' +
  '    .btn-login:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102,126,234,0.4); }' +
  '    .btn-login:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }' +
  '    .error-message {' +
  '      background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 8px; margin-bottom: 20px;' +
  '      font-size: 14px; border-left: 4px solid #ef4444; display: none;' +
  '    }' +
  '    .error-message.show { display: block; }' +
  '    .loading-spinner {' +
  '      display: inline-block; width: 16px; height: 16px; border: 2px solid white;' +
  '      border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;' +
  '      margin-right: 8px; vertical-align: middle;' +
  '    }' +
  '    @keyframes spin { to { transform: rotate(360deg); } }' +
  '    .footer { text-align: center; margin-top: 25px; color: #9ca3af; font-size: 13px; }' +
  '  </style>' +
  '</head>' +
  '<body>' +
  '  <div class="login-container">' +
  '    <div class="branding">' +
  '      <h1>Pixel to Programming</h1>' +
  '      <p class="subtitle">Danfoss ALADIN System</p>' +
  '    </div>' +
  '    <div class="divider"></div>' +
  '    <div id="errorMessage" class="error-message"></div>' +
  '    <form id="loginForm" method="post" action="javascript:void(0)" novalidate>' +
  '      <div class="form-group">' +
  '        <label for="username">Username</label>' +
  '        <input type="text" id="username" placeholder="Enter your username" required autocomplete="username">' +
  '      </div>' +
  '      <div class="form-group">' +
  '        <label for="password">Password</label>' +
  '        <input type="password" id="password" placeholder="Enter your password" required autocomplete="current-password">' +
  '      </div>' +
  '      <button type="submit" class="btn-login" id="loginBtn">Sign In</button>' +
  '    </form>' +
  '    <div class="footer">&copy; 2025 Danfoss. All rights reserved.</div>' +
  '  </div>' +
  '  <script>' +
  '    (function() {' +
  '      var CONFIG = {' +
  '        CREDENTIALS: { "admin": "admin123", "danfoss": "danfoss@2024", "user": "password123" },' +
  '        REDIRECT_URL: "http://localhost:5678/webhook-test/test_url"' +
  '      };' +
  '      var DOM = {' +
  '        form: document.getElementById("loginForm"),' +
  '        username: document.getElementById("username"),' +
  '        password: document.getElementById("password"),' +
  '        loginBtn: document.getElementById("loginBtn"),' +
  '        errorMessage: document.getElementById("errorMessage")' +
  '      };' +
  '      function showError(msg) {' +
  '        DOM.errorMessage.textContent = msg;' +
  '        DOM.errorMessage.classList.add("show");' +
  '        DOM.username.classList.add("error");' +
  '        DOM.password.classList.add("error");' +
  '        setTimeout(function() { DOM.errorMessage.classList.remove("show"); }, 4000);' +
  '      }' +
  '      function clearErrors() {' +
  '        DOM.errorMessage.classList.remove("show");' +
  '        DOM.username.classList.remove("error");' +
  '        DOM.password.classList.remove("error");' +
  '      }' +
  '      function validateCredentials(u, p) {' +
  '        return CONFIG.CREDENTIALS.hasOwnProperty(u) && CONFIG.CREDENTIALS[u] === p;' +
  '      }' +
  '      function setLoading(loading) {' +
  '        if (loading) {' +
  '          DOM.loginBtn.disabled = true;' +
  '          DOM.loginBtn.innerHTML = "<span class=\\"loading-spinner\\"></span>Signing in...";' +
  '        } else {' +
  '          DOM.loginBtn.disabled = false;' +
  '          DOM.loginBtn.textContent = "Sign In";' +
  '        }' +
  '      }' +
  '      function generateTimestampDraftId(username) {' +
  '        return username + "-" + new Date().getTime();' +
  '      }' +
  '      function handleLogin(event) {' +
  '        event.preventDefault();' +
  '        clearErrors();' +
  '        var username = DOM.username.value.trim();' +
  '        var password = DOM.password.value;' +
  '        if (!username || !password) {' +
  '          showError("Please enter both username and password");' +
  '          return;' +
  '        }' +
  '        setLoading(true);' +
  '        setTimeout(function() {' +
  '          if (validateCredentials(username, password)) {' +
  '            var draftId = generateTimestampDraftId(username);' +
  '            var loginTime = new Date().toISOString();' +
  '            sessionStorage.setItem("aladin_authenticated", "true");' +
  '            sessionStorage.setItem("aladin_username", username);' +
  '            sessionStorage.setItem("aladin_login_time", loginTime);' +
  '            sessionStorage.setItem("aladin_draft_id", draftId);' +
  '            console.log("Draft ID created:", draftId);' +
  '            DOM.loginBtn.innerHTML = "✓ Success! Loading...";' +
  '            fetch(CONFIG.REDIRECT_URL, {' +
  '              method: "POST",' +
  '              headers: { "Content-Type": "application/json" },' +
  '              body: JSON.stringify({' +
  '                draft_id: draftId,' +
  '                username: username,' +
  '                login_time: loginTime,' +
  '                action: "show_customer_input"' +
  '              })' +
  '            })' +
  '            .then(function(response) {' +
  '              if (!response.ok) throw new Error("Server error");' +
  '              return response.text();' +
  '            })' +
  '            .then(function(html) {' +
  '              console.log("Received Customer Input page");' +
  '              document.open();' +
  '              document.write(html);' +
  '              document.close();' +
  '            })' +
  '            .catch(function(error) {' +
  '              setLoading(false);' +
  '              showError("Connection error. Please try again.");' +
  '              console.error("Error:", error);' +
  '            });' +
  '          } else {' +
  '            setLoading(false);' +
  '            showError("Invalid username or password. Please try again.");' +
  '            DOM.password.value = "";' +
  '            DOM.password.focus();' +
  '          }' +
  '        }, 600);' +
  '      }' +
  '      DOM.form.addEventListener("submit", handleLogin);' +
  '      DOM.username.addEventListener("input", clearErrors);' +
  '      DOM.password.addEventListener("input", clearErrors);' +
  '      DOM.username.focus();' +
  '      console.log("Login page initialized");' +
  '    })();' +
  '  </script>' +
  '</body>' +
  '</html>';

return [{
  json: {},
  binary: {
    data: {
      data: Buffer.from(loginHtml).toString('base64'),
      mimeType: 'text/html',
      fileName: 'login.html'
    }
  }
}];
