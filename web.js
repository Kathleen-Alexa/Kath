// ==========================================
// WEB.JS - TASK LOGIC
// ==========================================
let unsubscribe;

// 1. READ TASKS
window.loadTasks = function() {
    if (unsubscribe) unsubscribe();

    const user = auth.currentUser;
    if (!user) return;

    // Listen to database
    unsubscribe = db.collection("tasks")
        .where("uid", "==", user.uid)
        .onSnapshot((snapshot) => {
            const list = document.getElementById("taskList");
            const emptyState = document.getElementById("emptyState");
            list.innerHTML = "";

            const tasks = [];
            let total = 0;
            let completed = 0;

            snapshot.forEach((doc) => {
                const task = { id: doc.id, ...doc.data() };
                tasks.push(task);
                total++;
                if (task.completed) completed++;
            });

            // Update Stats
            document.getElementById("remainingTasks").textContent = total - completed;
            document.getElementById("completedTasks").textContent = completed;

            // Show "Empty State" if no tasks
            if (total === 0) {
                emptyState.style.display = "block";
            } else {
                emptyState.style.display = "none";
            }

            // Sort: Not completed first
            tasks.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

            // Render Logic
            tasks.forEach((task) => {
                const li = document.createElement("li");
                if (task.completed) li.classList.add("completed");
                
                // Default to 'Medium' if no priority is set
                const priority = task.priority || "Medium";

                li.innerHTML = `
                    <input type="checkbox" 
                        ${task.completed ? "checked" : ""} 
                        onchange="toggleTask('${task.id}', ${task.completed})">
                    
                    <div class="task-details">
                        <span class="task-title">${task.title}</span>
                        <span class="task-tag tag-${priority}">${priority}</span>
                    </div>

                    <button onclick="deleteTask('${task.id}')" class="btn-delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                `;

                list.appendChild(li);
            });
        });
};

// 2. CREATE TASK
function addTask() {
    const input = document.getElementById("taskInput");
    const prioritySelect = document.getElementById("taskPriority");
    const title = input.value.trim();
    const priority = prioritySelect.value;
    const user = auth.currentUser;

    if (!title) return;

    db.collection("tasks").add({
        title: title,
        priority: priority,
        completed: false,
        uid: user.uid,
        createdAt: new Date()
    }).then(() => {
        input.value = ""; // Clear box
    });
}

// 3. UPDATE TASK
function toggleTask(id, currentStatus) {
    db.collection("tasks").doc(id).update({
        completed: !currentStatus
    });
}

// 4. DELETE TASK
function deleteTask(id) {
    if(confirm("Remove this task?")) {
        db.collection("tasks").doc(id).delete();
    }
}