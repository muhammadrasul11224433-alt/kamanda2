renderNavbar('');

// If already logged in, skip straight to products
if (Auth.isLoggedIn() && (location.pathname.endsWith('login.html') || location.pathname.endsWith('register.html'))){
  window.location.href = 'products.html';
}

function setFieldError(id, hasError){
  const field = document.getElementById(id);
  if (field) field.classList.toggle('has-error', hasError);
}

/* ---------------- Register ---------------- */
const registerForm = document.getElementById('register-form');
if (registerForm){
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let valid = true;
    setFieldError('f-name', !name); if (!name) valid = false;
    setFieldError('f-email', !/^\S+@\S+\.\S+$/.test(email)); if (!/^\S+@\S+\.\S+$/.test(email)) valid = false;
    setFieldError('f-password', password.length < 6); if (password.length < 6) valid = false;
    setFieldError('f-confirm', password !== confirmPassword); if (password !== confirmPassword) valid = false;
    if (!valid) return;

    const btn = document.getElementById('submit-btn');
    btn.disabled = true; btn.textContent = 'Лутфан интизор шавед…';
    try{
      const { token, user } = await Api.register({ name, email, phone, password, confirmPassword });
      Auth.setSession(token, user);
      showModal({
        title: 'Хуш омадед!',
        message: 'Ҳисоби шумо бомуваффақият сохта шуд.',
        actions: [{ label: 'Идома додан', onClick: () => window.location.href = 'products.html' }]
      });
    }catch(err){
      showModal({ icon: 'error', title: 'Хатогӣ', message: err.message });
    }finally{
      btn.disabled = false; btn.textContent = 'Сабти ном';
    }
  });
}

/* ---------------- Login ---------------- */
const loginForm = document.getElementById('login-form');
if (loginForm){
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let valid = true;
    setFieldError('f-email', !/^\S+@\S+\.\S+$/.test(email)); if (!/^\S+@\S+\.\S+$/.test(email)) valid = false;
    setFieldError('f-password', !password); if (!password) valid = false;
    if (!valid) return;

    const btn = document.getElementById('submit-btn');
    btn.disabled = true; btn.textContent = 'Лутфан интизор шавед…';
    try{
      const { token, user } = await Api.login({ email, password });
      Auth.setSession(token, user);
      window.location.href = user.role === 'admin' ? 'admin.html' : 'products.html';
    }catch(err){
      showModal({ icon: 'error', title: 'Воридшавӣ ноком шуд', message: err.message });
    }finally{
      btn.disabled = false; btn.textContent = 'Воридшавӣ';
    }
  });

  document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    showModal({ title: 'Барқарорсозии парол', message: 'Барои барқарор кардани парол бо дастгирии мизоҷон тамос гиред ё почтаи худро санҷед.' });
  });
}
