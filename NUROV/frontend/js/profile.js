renderNavbar('');
renderFooter();
Auth.requireLogin();

async function loadProfile(){
  try{
    const { user } = await Api.me();
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-avatar').src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('avatar_url').value = user.avatar_url || '';
  }catch(e){ toast(e.message, 'error'); }
}

document.querySelectorAll('.profile-menu a[data-tab]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.profile-menu a[data-tab]').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.getElementById('tab-info').style.display = link.dataset.tab === 'info' ? 'block' : 'none';
    document.getElementById('tab-password').style.display = link.dataset.tab === 'password' ? 'block' : 'none';
  });
});

document.getElementById('logout-link').addEventListener('click', (e) => { e.preventDefault(); logout(); });

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try{
    await Api.updateProfile({
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      avatar_url: document.getElementById('avatar_url').value.trim()
    });
    const user = Auth.getUser();
    user.name = document.getElementById('name').value.trim();
    user.avatar_url = document.getElementById('avatar_url').value.trim();
    localStorage.setItem('bcp_user', JSON.stringify(user));
    toast('Маълумот навсозӣ шуд ✓', 'success');
    loadProfile();
    renderNavbar('');
  }catch(err){ toast(err.message, 'error'); }
});

document.getElementById('password-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try{
    await Api.changePassword({
      currentPassword: document.getElementById('currentPassword').value,
      newPassword: document.getElementById('newPassword').value
    });
    document.getElementById('password-form').reset();
    showModal({ title: 'Парол иваз шуд', message: 'Пароли шумо бомуваффақият навсозӣ шуд.' });
  }catch(err){ showModal({ icon:'error', title:'Хатогӣ', message: err.message }); }
});

loadProfile();
