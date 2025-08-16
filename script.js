// Selectors
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const prioritySelect = document.getElementById("priority");
const categorySelect = document.getElementById("category");
const progressFill = document.getElementById("progressFill");
const themeToggle = document.getElementById("themeToggle");
const reminderSound = document.getElementById("reminderSound");

// Timer Elements
const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");
const resetTimerBtn = document.getElementById("resetTimer");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let completedTasks = 0;

// ========== TASK MANAGEMENT ==========
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("task", `priority-${task.priority}`);
    if (task.completed) li.classList.add("completed");

   li.innerHTML = `
  <span>[${task.category}] ${task.text}</span>
  <div class="task-actions">
    <button class="action-btn complete-btn" onclick="toggleComplete(${index})" aria-label="Mark as complete">✔</button>
    <button class="action-btn delete-btn" onclick="deleteTask(${index})" aria-label="Delete task">🗑</button>
  </div>
`;

    taskList.appendChild(li);
  });
  updateProgress();
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  if (taskInput.value.trim() === "") return;
  const newTask = {
    text: taskInput.value,
    priority: prioritySelect.value,
    category: categorySelect.value,
    completed: false
  };
  tasks.push(newTask);
  taskInput.value = "";
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  if (tasks[index].completed) {
    reminderSound.play();
    if (Notification.permission === "granted") {
      new Notification("Task Completed ✅", {
        body: tasks[index].text
      });
    }
  }
  renderTasks();
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const percent = total > 0 ? (done / total) * 100 : 0;
  progressFill.style.width = percent + "%";
}

// ========== THEME TOGGLE ==========
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// ========== POMODORO TIMER ==========
let timer;
let timeLeft = 25 * 60; // 25 minutes

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent =
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      timer = null;
      reminderSound.play();
      alert("Pomodoro finished! Take a 5-minute break ☕");
      timeLeft = 5 * 60; // switch to break
      updateTimerDisplay();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  timeLeft = 25 * 60;
  updateTimerDisplay();
}

startTimerBtn.addEventListener("click", startTimer);
resetTimerBtn.addEventListener("click", resetTimer);

// ========== INIT ==========
addTaskBtn.addEventListener("click", addTask);
renderTasks();
updateTimerDisplay();

// Request notification permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
