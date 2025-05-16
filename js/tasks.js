// Список пользователей
const users = [
  { id: 1, name: 'admin', password: 'admin', role: 'admin' },
  { id: 2, name: 'ivan', password: '123', role: 'user' }
];

// Список задач
let tasks = [
  { id: 1, text: 'Выучить HTML', done: false, assignedTo: 'ivan' },
  { id: 2, text: 'Выучить CSS', done: false, assignedTo: 'ivan' }
];

// Элементы формы
const loginForm = document.getElementById('login');
const taskManager = document.getElementById('task-manager');
const usernameInput = document.getElementById('username');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Функция проверки логина
function handleLogin(event) {
  event.preventDefault();
  const username = usernameInput.value;
  const password = document.getElementById('password').value;

  const user = users.find(u => u.name === username && u.password === password);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    showTasks(user);
  } else {
    alert('Неверный логин или пароль');
  }
}

// Показываем задачи
function showTasks(user) {
  loginForm.style.display = 'none';
  taskManager.classList.remove('hidden');
  renderTasks(user.name);
}

// Рендер задач
function renderTasks(username) {
  taskList.innerHTML = '';
  const userTasks = tasks.filter(task => task.assignedTo === username);

  if (userTasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет задач';
    taskList.appendChild(li);
    return;
  }

  userTasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <label>
        <input type="checkbox" ${task.done ? 'checked disabled' : ''}>
        ${task.text}
      </label>
    `;
    taskList.appendChild(li);
  });
}

// Добавление новой задачи
function addTask(event) {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const newTask = {
    id: Date.now(),
    text: text,
    done: false,
    assignedTo: currentUser.name
  };

  tasks.push(newTask);
  taskInput.value = '';
  renderTasks(currentUser.name);
}

// При загрузке страницы проверяем, вошёл ли пользователь
window.onload = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    loginForm.style.display = 'none';
    taskManager.classList.remove('hidden');
    renderTasks(currentUser.name);
  }
};