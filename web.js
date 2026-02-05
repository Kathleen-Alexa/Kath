// ==========================================
// web.js: PRO VERSION
// ==========================================
let unsubscribe;

// 1. READ TASKS (With Date Formatting & Summary)
window.loadTasks = function() {
    if (unsubscribe) unsubscribe();

    const user = auth.currentUser;
    if (!user) return;

    // Listen to changes in real-time
    unsubscribe = db.collection("tasks")
        .where("uid", "==", user.uid)
        .onSnapshot((snapshot) => {
            const list = document.getElementById("taskList");
            list.innerHTML = "";

            const tasks = [];
            let total = 0;
            let completedCount = 0;

            snapshot.forEach((doc) => {
                // Get data and add the ID
                const data = doc.data();
                const task = { id: doc.id, ...data };
                tasks.push(task);
                
                // Math for the summary
                total++;
                if (task.completed) completedCount++;
            });

            // Update the Dashboard Numbers
            document.getElementById("totalTasks").textContent = total;
            document.getElementById("completedTasks").textContent = completedCount;
            document.getElementById("remainingTasks").textContent = total - completedCount;

            // Sort by Date (Newest First)
            tasks.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

            // Render the List
            tasks.forEach((task) => {
                const li = document.createElement("li");
                if (task.completed) li.classList.add("completed");

                // Format the Date (e.g., "Oct 24")
                const dateStr = task.createdAt ? task.createdAt.toDate().toLocaleDateString() : "";

                li.innerHTML = `
                    <div class="task-left">
                        <label>
                            <input type="checkbox" 
                                ${task.completed ? "checked" : ""} 
                                onchange="toggleTask('${task.id}', ${task.completed})">
                            <div class="task-info">
                                <span class="task-title">${task.title}</span>
                                <span class="task-date">${dateStr}</span>
                            </div>
                        </label>
                    </div>
                    <div class="task-actions">
                        <button class="btn-edit" onclick="editTask('${task.id}', '${task.title}')">✎</button>
                        <button class="btn-delete" onclick="deleteTask('${task.id}')">✕</button>
                    </div>
                `;

                list.appendChild(li);
            });
        });
};

// 2. CREATE TASK
function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();
    const user = auth.currentUser;

    if (!title) return; // Don't alert, just do nothing if empty

    db.collection("tasks").add({
        title: title,
        completed: false,
        uid: user.uid,
        createdAt: new Date() // Adds the timestamp
    }).then(() => {
        input.value = ""; // Clear input
    });
}

// 3. UPDATE STATUS (Toggle Checkbox)
function toggleTask(id, currentStatus) {
    db.collection("tasks").doc(id).update({
        completed: !currentStatus
    });
}

// 4. EDIT TASK (New Feature!)
function editTask(id, oldTitle) {
    const newTitle = prompt("Update your task:", oldTitle);
    if (newTitle && newTitle.trim() !== "") {
        db.collection("tasks").doc(id).update({
            title: newTitle.trim()
        });
    }
}

// 5. DELETE SINGLE TASK
function deleteTask(id) {
    // No confirm needed for single delete (smoother UX)
    db.collection("tasks").doc(id).delete();
}

// 6. CLEAR COMPLETED (New Feature!)
function clearCompleted() {
    const user = auth.currentUser;
    
    // Find all completed tasks for this user
    db.collection("tasks")
      .where("uid", "==", user.uid)
      .where("completed", "==", true)
      .get()
      .then((snapshot) => {
          // Delete them one by one
          const batch = db.batch(); // Advanced: Use batch for atomic writes if you want, but loop is fine for Lab
          snapshot.forEach(doc => {
              doc.ref.delete();
          });
      });
}