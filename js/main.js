let users = JSON.parse(localStorage.getItem('users')) || [
  { login: 'admin', name: 'Админ Иванов', password: 'admin', role: 'admin' },
  { login: 'boss', name: 'Алексей Петров', password: 'boss', role: 'chief', team: ['ivan'] },
  { login: 'ivan', name: 'Иван Иванов', password: '123', role: 'employee', chief: 'boss', notifications: [] }
];

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

window.onload = () => {
  if (currentUser) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('user-panel').classList.remove('hidden');

    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('new-name').value = currentUser.name;
    document.getElementById('new-position').value = currentUser.position || '';
    document.getElementById('new-login').value = currentUser.login;
    document.getElementById('new-password').value = currentUser.password;

    if (currentUser.role === 'admin') {
      document.getElementById('admin-panel').classList.remove('hidden');
      renderAllUsers();
    }

    if (currentUser.role === 'chief') {
      document.getElementById('manager-team').classList.remove('hidden');
      renderManagerTeam();
    }

    renderUserTasks();
    renderNotifications();
  }

  renderUsersForChiefSelect(); // для формы назначения задач
};

function handleLogin(e) {
  e.preventDefault();
  const login = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  const user = users.find(u => u.login === login && u.password === pass);

  if (!user) {
    alert('Неверный логин или пароль');
    return;
  }

  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  window.location.reload();
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.reload();
}

function updateProfile(e) {
  e.preventDefault();
  const newLogin = document.getElementById('new-login').value.trim();
  const newName = document.getElementById('new-name').value.trim();
  const newPosition = document.getElementById('new-position').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();

  currentUser.login = newLogin;
  currentUser.name = newName;
  currentUser.position = newPosition;
  currentUser.password = newPassword;

  const index = users.findIndex(u => u.login === currentUser.login);
  users[index] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));

  alert('Профиль успешно обновлён!');
}

function addUser(e) {
  e.preventDefault(); // отменяем стандартное поведение формы

  const login = document.getElementById('user-login').value.trim();
  const name = document.getElementById('user-name').value.trim();
  const position = document.getElementById('user-position').value.trim();
  const password = document.getElementById('user-password').value.trim();
  const role = document.getElementById('user-role').value.trim();

  // ✅ Безопасное получение значения из select
  const chiefSelect = document.getElementById('user-chief');
  const chief = chiefSelect ? chiefSelect.value.trim() : '';

  // Проверка на дубликат
  if (users.some(u => u.login === login)) {
    alert('Пользователь с таким логином уже существует');
    return;
  }

  // Создание нового пользователя
  const newUser = {
    login,
    name,
    position,
    password,
    role,
    notifications: []
  };

  if (role === 'employee' && chief) {
    newUser.chief = chief;
  } else if (role === 'chief' || role === 'admin') {
    newUser.team = [];
  }

  users.push(newUser);

  // Если это сотрудник → добавляем его в команду начальнику
  if (role === 'employee' && chief) {
    const chiefUser = users.find(u => u.login === chief && u.role === 'chief');
    if (chiefUser) {
      if (!chiefUser.team) chiefUser.team = [];
      chiefUser.team.push(login);
    }
  }

  // Сохраняем всё в localStorage
  localStorage.setItem('users', JSON.stringify(users));

  alert('✅ Пользователь добавлен!');
  e.target.reset(); // очищаем форму
  renderAllUsers(); // обновляем список
  renderUsersForChiefSelect(); // обновляем datalist
}

function renderAllUsers() {
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.name} (${user.login}) — ${user.role}`;
    list.appendChild(li);
  });
}

function toggleChiefField(role) {
  const select = document.getElementById('user-chief');
  select.classList.toggle('hidden', role !== 'employee');

  select.innerHTML = '<option value="">Выберите начальника</option>';
  const chiefs = users.filter(u => u.role === 'chief');
  chiefs.forEach(chief => {
    const option = document.createElement('option');
    option.value = chief.login;
    option.textContent = chief.name;
    select.appendChild(option);
  });
}

function renderUsersForChiefSelect() {
  const datalist = document.getElementById('users');
  datalist.innerHTML = '';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.login;
    datalist.appendChild(option);
  });
}

function createTask(e) {
  e.preventDefault();
  const assignee = document.getElementById('assignee').value.trim();
  const title = document.getElementById('task-title').value.trim();
  const deadline = document.getElementById('deadline').value;

  const task = {
    id: Date.now(),
    title,
    from: currentUser.name,
    to: assignee,
    status: 'ожидает',
    deadline
  };

  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  const user = users.find(u => u.login === assignee);
  if (user) {
    user.notifications.push(`Вам назначена задача: "${title}"`);
    localStorage.setItem('users', JSON.stringify(users));
  }

  alert('Задача назначена!');
  e.target.reset();
  if (currentUser.role === 'chief') renderTasksForManagerTeam();
  if (currentUser.role === 'admin') renderAllTasksForAdmin();
}

function renderUserTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  const filtered = tasks.filter(task => task.to === currentUser.login);

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет активных задач';
    list.appendChild(li);
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${task.title}</strong><br/>
      От: ${task.from}<br/>
      Срок: ${task.deadline}<br/>
      Статус: 
      <select onchange="updateTaskStatus(${task.id}, this.value)">
        <option value="ожидает" ${task.status === 'ожидает' ? 'selected' : ''}>Ожидает</option>
        <option value="в работе" ${task.status === 'в работе' ? 'selected' : ''}>В работе</option>
        <option value="выполнено" ${task.status === 'выполнено' ? 'selected' : ''}>Выполнено</option>
      </select>
    `;
    list.appendChild(li);
  });
}

function updateTaskStatus(taskId, newStatus) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderUserTasks();
    if (currentUser.role === 'chief') renderTasksForManagerTeam();
    if (currentUser.role === 'admin') renderAllTasksForAdmin();
  }
}

function renderNotifications() {
  const list = document.getElementById('notification-list');
  list.innerHTML = '';
  const user = users.find(u => u.login === currentUser.login);

  if (!user.notifications || user.notifications.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет уведомлений';
    list.appendChild(li);
    return;
  }

  user.notifications.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    list.appendChild(li);
  });

  user.notifications = [];
  localStorage.setItem('users', JSON.stringify(users));
}

function renderManagerTeam() {
  const list = document.getElementById('team-list');
  list.innerHTML = '';
  const chief = users.find(u => u.login === currentUser.login);

  if (!chief.team || chief.team.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет сотрудников в команде';
    list.appendChild(li);
    return;
  }

  chief.team.forEach(login => {
    const user = users.find(u => u.login === login);
    const li = document.createElement('li');
    li.textContent = `${user.name} — ${user.position}`;
    li.style.cursor = 'pointer';
    li.onclick = () => showUserTasks(login);
    list.appendChild(li);
  });
}

function showUserTasks(login) {
  const container = document.getElementById('team-tasks');
  container.innerHTML = `<h4>Задачи для ${login}</h4>`;
  const ul = document.createElement('ul');

  const userTasks = tasks.filter(task => task.to === login);

  if (userTasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет задач';
    ul.appendChild(li);
  } else {
    userTasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${task.title}</strong><br/>
        Статус: 
        <select onchange="updateTaskStatus(${task.id}, this.value)">
          <option value="ожидает" ${task.status === 'ожидает' ? 'selected' : ''}>Ожидает</option>
          <option value="в работе" ${task.status === 'в работе' ? 'selected' : ''}>В работе</option>
          <option value="выполнено" ${task.status === 'выполнено' ? 'selected' : ''}>Выполнено</option>
        </select>
      `;
      ul.appendChild(li);
    });
  }

  container.appendChild(ul);
}

function renderTasksForManagerTeam() {
  const list = document.getElementById('team-tasks');
  list.innerHTML = '';
  const chief = users.find(u => u.login === currentUser.login);

  if (!chief.team || chief.team.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет команды';
    list.appendChild(li);
    return;
  }

  chief.team.forEach(login => {
    const user = users.find(u => u.login === login);
    const userTasks = tasks.filter(task => task.to === login);

    const h5 = document.createElement('h4');
    h5.textContent = `Задачи: ${user.name}`;
    list.appendChild(h5);

    const ul = document.createElement('ul');

    if (userTasks.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Нет задач';
      ul.appendChild(li);
    } else {
      userTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${task.title}</strong><br/>
          Статус: ${task.status}
          <select onchange="updateTaskStatus(${task.id}, this.value)">
            <option value="ожидает" ${task.status === 'ожидает' ? 'selected' : ''}>Ожидает</option>
            <option value="в работе" ${task.status === 'в работе' ? 'selected' : ''}>В работе</option>
            <option value="выполнено" ${task.status === 'выполнено' ? 'selected' : ''}>Выполнено</option>
          </select>
        `;
        ul.appendChild(li);
      });
    }

    list.appendChild(ul);
  });
}

function renderAllTasksForAdmin() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${task.title}</strong><br/>
      Кому: ${task.to}<br/>
      Срок: ${task.deadline}<br/>
      Статус: ${task.status}
    `;
    list.appendChild(li);
  });
}