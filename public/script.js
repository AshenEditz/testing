/* public/script.js */

// Pairing Logic
async function getCode() {
    const phone = document.getElementById("phone").value;
    const btn = document.getElementById("btnAction");
    const codeArea = document.getElementById("codeArea");
    const codeText = document.getElementById("code");

    if(!phone) return alert("Please enter your number!");
    
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        const req = await fetch(`/pair?phone=${phone}`);
        const res = await req.json();
        
        if(res.status) {
            codeArea.classList.remove("hidden");
            codeText.innerText = res.code;
            btn.innerText = "Code Generated ✅";
        } else {
            alert("Error: " + res.error);
            btn.innerText = "Get Pairing Code";
            btn.disabled = false;
        }
    } catch(e) {
        alert("Server Error. Check console.");
        console.error(e);
        btn.innerText = "Try Again";
        btn.disabled = false;
    }
}

// --- ADMIN PANEL LOGIC ---

// Explicit function to OPEN the modal
function openAdmin() {
    document.getElementById("adminPanel").classList.remove("hidden");
}

// Explicit function to CLOSE the modal
function closeAdmin() {
    document.getElementById("adminPanel").classList.add("hidden");
}

// Login Logic
async function adminLogin() {
    const email = document.getElementById("admEmail").value;
    const pass = document.getElementById("admPass").value;
    
    if(!email || !pass) return alert("Fill in all fields");

    try {
        const req = await fetch('/admin/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password: pass})
        });
        
        if (req.status !== 200) throw new Error("Server Error");

        const res = await req.json();
        if(res.success) {
            alert("✅ Login Successful!");
            // Hide Login Form, Show Dashboard
            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("dashboard").classList.remove("hidden");
            document.getElementById("botCount").innerText = res.count;
        } else {
            alert("❌ Invalid Email or Password");
        }
    } catch(e) {
        console.error(e);
        alert("Failed to connect to server.");
    }
}

// Broadcast Logic
async function sendBroadcast() {
    const msg = document.getElementById("broadcastTxt").value;
    const email = document.getElementById("admEmail").value;
    const pass = document.getElementById("admPass").value;
    
    if(!msg) return alert("Write a message first!");

    try {
        await fetch('/admin/broadcast', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password: pass, message: msg})
        });
        alert("✅ Broadcast Sent to all bots!");
        document.getElementById("broadcastTxt").value = "";
    } catch(e) {
        alert("Error sending broadcast");
    }
            }
