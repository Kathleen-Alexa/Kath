// ==========================================
// FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCnhPyc5ng2qcAcw_U66kMNUqJpkrBck6E",
  authDomain: "website-project-a3db8.firebaseapp.com",
  projectId: "website-project-a3db8",
  storageBucket: "website-project-a3db8.firebasestorage.app",
  messagingSenderId: "883091422030",
  appId: "1:883091422030:web:44e28f6ac0161e4f51fc1f"
};

// Initialize Firebase ONCE
firebase.initializeApp(firebaseConfig);

window.auth = firebase.auth();
window.db = firebase.firestore();

// ==========================================
// AUTH FUNCTIONS
// ==========================================
function loginWithEmail() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const msg = document.getElementById("loginMsg");

    auth.signInWithEmailAndPassword(email, password)
        .catch(err => {
            msg.textContent = err.message;
            msg.style.color = "red";
        });
}

function registerWithEmail() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const msg = document.getElementById("loginMsg");

    auth.createUserWithEmailAndPassword(email, password)
        .catch(err => {
            msg.textContent = err.message;
            msg.style.color = "red";
        });
}

function logout() {
    auth.signOut();
}

// ==========================================
// AUTH STATE LISTENER
// ==========================================
auth.onAuthStateChanged((user) => {
    const loginSec = document.getElementById("loginSection");
    const appSec = document.getElementById("appSection");

    if (user) {
        loginSec.style.display = "none";
        appSec.style.display = "block";

        if (window.loadTasks) {
            window.loadTasks();
        }

    } else {
        loginSec.style.display = "block";
        appSec.style.display = "none";
    }
});
