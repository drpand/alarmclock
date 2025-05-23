const digitalClock = document.querySelector('.digital-clock');
const digitalDate = document.querySelector('.digital-date');
const hourHand = document.querySelector('.circle i:nth-child(3)');
const minuteHand = document.querySelector('.circle i:nth-child(2)');
const secondHand = document.querySelector('.circle i:nth-child(1)');
const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');
const alarmSettingsBtn = document.querySelector('.alarm-settings-btn');
const alarmMenu = document.querySelector('.alarm-menu');
const addAlarmBtn = document.querySelector('.add-alarm-btn');
const alarmFormContainer = document.querySelector('.alarm-form-container');
const alarmForm = document.querySelector('.alarm-form');
const alarmsList = document.querySelector('.alarms-list');
const alarmAudio = document.querySelector('#alarm-sound');
const themeButtons = document.querySelectorAll('.theme-btn');
const todoSettingsBtn = document.querySelector('.todo-settings-btn');
const todoMenu = document.querySelector('.todo-menu');
const addTodoBtn = document.querySelector('.add-todo-btn');
const todoFormContainer = document.querySelector('.todo-form-container');
const todoForm = document.querySelector('.todo-form');
const todosList = document.querySelector('.todos-list');

let alarms = [];
let activeAlarm = null;
let todos = [];

// Функция для закрытия всех меню
function closeAllMenus() {
    if (settingsMenu) settingsMenu.classList.remove('active');
    if (alarmMenu) alarmMenu.classList.remove('active');
    if (todoMenu) todoMenu.classList.remove('active');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных будильников из localStorage
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
        alarms = JSON.parse(savedAlarms);
        renderAlarms();
    }
    
    // Загрузка сохраненной темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === savedTheme.replace('theme-', '')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Загрузка сохраненных задач
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }
    
    // Инициализация часов
    updateClock();
    setInterval(updateClock, 1000);
    
    // Добавляем обработчики событий для кнопок в меню
    setupMenuButtons();
    
    // Инициализация обработчиков для меню задач
    if (todoSettingsBtn && todoMenu) {
        todoSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeAllMenus();
            todoMenu.classList.toggle('active');
        });
    }

    if (addTodoBtn && todoFormContainer) {
        addTodoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            todoFormContainer.classList.toggle('active');
        });
    }

    if (todoForm) {
        todoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id');
            const task = formData.get('task');
            const priority = formData.get('priority');
            const deadline = formData.get('deadline');

            if (task) {
                if (id) {
                    // Редактирование существующей задачи
                    const index = todos.findIndex(t => t.id === parseInt(id));
                    if (index !== -1) {
                        todos[index] = {
                            ...todos[index],
                            task,
                            priority,
                            deadline,
                        };
                    }
                } else {
                    // Добавление новой задачи
                    const todo = {
                        id: Date.now(),
                        task,
                        priority,
                        deadline,
                        completed: false
                    };
                    todos.push(todo);
                }

                // Сохраняем задачи в localStorage
                localStorage.setItem('todos', JSON.stringify(todos));

                renderTodos();
                e.target.reset();
                todoFormContainer.classList.remove('active');
            }
        });
    }
});

// Настройка обработчиков событий для кнопок в меню
function setupMenuButtons() {
    // Обработчики для кнопок темы
    if (themeButtons) {
        themeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Удаляем активный класс у всех кнопок
                themeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Добавляем активный класс текущей кнопке
                button.classList.add('active');
                
                // Применяем тему
                const theme = button.dataset.theme;
                if (theme === 'bw') {
                    document.body.classList.add('theme-bw');
                    document.body.classList.remove('theme-blue');
                    localStorage.setItem('theme', 'theme-bw');
                } else {
                    document.body.classList.add('theme-blue');
                    document.body.classList.remove('theme-bw');
                    localStorage.setItem('theme', 'theme-blue');
                }
            });
        });
    }
    
    // Обработчик для кнопки добавления будильника
    if (addAlarmBtn) {
        addAlarmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (alarmFormContainer) {
                alarmFormContainer.classList.toggle('active');
            }
        });
    }
    
    // Обработчик для формы будильника
    if (alarmForm) {
        alarmForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = formData.get('id');
            const time = formData.get('time');
            const date = formData.get('date');
            const label = formData.get('label') || 'Будильник';
            
            if (time && date) {
                if (id) {
                    // Update existing alarm
                    const index = alarms.findIndex(a => a.id === parseInt(id));
                    if (index !== -1) {
                        alarms[index] = {
                            ...alarms[index],
                            time,
                            date,
                            label
                        };
                    }
                } else {
                    // Add new alarm
                    const alarm = {
                        id: Date.now(),
                        time,
                        date,
                        label,
                        active: true
                    };
                    alarms.push(alarm);
                }
                
                // Сохраняем будильники в localStorage
                localStorage.setItem('alarms', JSON.stringify(alarms));
                
                renderAlarms();
                e.target.reset();
                if (alarmFormContainer) alarmFormContainer.classList.remove('active');
            }
        });
    }
}

// Settings menu toggle
if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeAllMenus(); // Закрываем все меню перед открытием
        settingsMenu.classList.toggle('active');
    });
}

// Alarm menu toggle
if (alarmSettingsBtn && alarmMenu) {
    alarmSettingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeAllMenus(); // Закрываем все меню перед открытием
        alarmMenu.classList.toggle('active');
    });
}

// Todo menu toggle
if (todoSettingsBtn && todoMenu) {
    todoSettingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeAllMenus(); // Закрываем все меню перед открытием
        todoMenu.classList.toggle('active');
    });
}

// Close menus when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.settings-menu') && 
        !e.target.closest('.settings-btn') && 
        !e.target.closest('.alarm-menu') && 
        !e.target.closest('.alarm-settings-btn') &&
        !e.target.closest('.todo-menu') &&
        !e.target.closest('.todo-settings-btn')) {
        closeAllMenus();
    }
});

// Render alarms list
function renderAlarms() {
    if (!alarmsList) return;
    
    alarmsList.innerHTML = alarms
        .map(alarm => `
            <div class="alarm-item" data-id="${alarm.id}">
                <div class="alarm-info">
                    <div class="alarm-time">${alarm.time}</div>
                    <div class="alarm-date">${formatDate(alarm.date)}</div>
                    <div class="alarm-label">${alarm.label}</div>
                </div>
                <div class="alarm-controls">
                    <button class="alarm-toggle ${alarm.active ? 'active' : ''}" data-id="${alarm.id}">
                        <i class="fas ${alarm.active ? 'fa-bell' : 'fa-bell-slash'}"></i>
                    </button>
                    <button class="alarm-edit" data-id="${alarm.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="alarm-delete" data-id="${alarm.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `)
        .join('');
    
    // Add event listeners to the newly created buttons
    document.querySelectorAll('.alarm-toggle').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            toggleAlarm(id);
        });
    });
    
    document.querySelectorAll('.alarm-edit').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            editAlarm(id);
        });
    });
    
    document.querySelectorAll('.alarm-delete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            deleteAlarm(id);
        });
    });
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Toggle alarm
function toggleAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        alarm.active = !alarm.active;
        localStorage.setItem('alarms', JSON.stringify(alarms));
        renderAlarms();
    }
}

// Edit alarm
function editAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm && alarmForm) {
        // Fill form with alarm data
        alarmForm.querySelector('[name="id"]').value = alarm.id;
        alarmForm.querySelector('[name="time"]').value = alarm.time;
        alarmForm.querySelector('[name="date"]').value = alarm.date;
        alarmForm.querySelector('[name="label"]').value = alarm.label;
        
        // Show form
        if (alarmFormContainer) alarmFormContainer.classList.add('active');
        
        // Scroll to form
        alarmFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete alarm
function deleteAlarm(id) {
    alarms = alarms.filter(alarm => alarm.id !== id);
    localStorage.setItem('alarms', JSON.stringify(alarms));
    renderAlarms();
}

// Update clock and check alarms
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Обновляем цифровые часы
    if (digitalClock) {
        digitalClock.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Обновляем аналоговые стрелки
    if (hourHand && minuteHand && secondHand) {
        const secondsDegrees = ((seconds / 60) * 360);
        const minutesDegrees = ((minutes / 60) * 360) + ((seconds/60)*6);
        const hoursDegrees = ((hours / 12) * 360) + ((minutes/60)*30);
        
        secondHand.style.transform = `translate(-50%, -100%) rotate(${secondsDegrees}deg)`;
        minuteHand.style.transform = `translate(-50%, -100%) rotate(${minutesDegrees}deg)`;
        hourHand.style.transform = `translate(-50%, -100%) rotate(${hoursDegrees}deg)`;
    }
    
    // Обновляем дату
    if (digitalDate) {
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        digitalDate.textContent = `${day} ${month} ${year}`;
    }
    
    // Проверяем будильники
    if (!activeAlarm) {
        const currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const currentDate = now.toISOString().split('T')[0];
        
        alarms.forEach(alarm => {
            if (alarm.active && 
                alarm.time === currentTime && 
                alarm.date === currentDate && 
                seconds === 0) {
                triggerAlarm(alarm);
            }
        });
    }
}

// Trigger alarm
function triggerAlarm(alarm) {
    activeAlarm = alarm;
    if (alarmAudio) {
        alarmAudio.currentTime = 0;
        alarmAudio.play().catch(error => {
            console.error('Error playing alarm sound:', error);
        });
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'alarm-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>${alarm.label}</h3>
            <p>${alarm.time}</p>
        </div>
        <button class="stop-alarm">
            <i class="fas fa-stop"></i>
        </button>
    `;
    document.body.appendChild(notification);
    
    // Add event listener to the stop button
    const stopButton = notification.querySelector('.stop-alarm');
    if (stopButton) {
        stopButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            stopAlarm();
        });
    }
}

// Stop alarm
function stopAlarm() {
    if (activeAlarm) {
        if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
        }
        activeAlarm = null;
        
        // Remove notification
        const notification = document.querySelector('.alarm-notification');
        if (notification) {
            notification.remove();
        }
    }
}

// Отображение списка задач
function renderTodos() {
    if (!todosList) return;

    todosList.innerHTML = todos
        .map(todo => `
            <div class="todo-item" data-id="${todo.id}">
                <div class="todo-info">
                    <div class="todo-task ${todo.completed ? 'completed' : ''}">${todo.task}</div>
                    ${todo.deadline ? `<div class="todo-deadline">${formatDate(todo.deadline)}</div>` : ''}
                    <span class="todo-priority ${todo.priority}">${getPriorityText(todo.priority)}</span>
                </div>
                <div class="todo-controls">
                    <button class="todo-toggle ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                        <i class="fas ${todo.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                    </button>
                    <button class="todo-edit" data-id="${todo.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-delete" data-id="${todo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `)
        .join('');

    // Добавляем обработчики для кнопок
    todosList.querySelectorAll('.todo-toggle').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            toggleTodo(id);
        });
    });

    todosList.querySelectorAll('.todo-edit').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            editTodo(id);
        });
    });

    todosList.querySelectorAll('.todo-delete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            deleteTodo(id);
        });
    });
}

// Переключение статуса задачи
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }
}

// Редактирование задачи
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo && todoForm) {
        todoForm.querySelector('[name="id"]').value = todo.id;
        todoForm.querySelector('[name="task"]').value = todo.task;
        todoForm.querySelector('[name="priority"]').value = todo.priority;
        if (todo.deadline) {
            todoForm.querySelector('[name="deadline"]').value = todo.deadline;
        }

        todoFormContainer.classList.add('active');
        todoFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Удаление задачи
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

// Получение текста приоритета
function getPriorityText(priority) {
    switch (priority) {
        case 'low':
            return 'Низкий';
        case 'medium':
            return 'Средний';
        case 'high':
            return 'Высокий';
        default:
            return '';
    }
} 