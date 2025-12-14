async function getCode() {
    const phone = document.getElementById("phone").value;
    const btn = document.getElementById("btnAction");
    
    if(!phone) return alert("Enter number!");
    btn.innerText = "Generating...";
    
    try {
        const req = await fetch(`/pair?phone=${phone}`);
        const res = await req.json();
        
        if(res.status) {
            document.getElementById("codeArea").classList.remove("hidden");
            document.getElementById("code").innerText = res.code;
            btn.innerText = "Pairing Code Generated";
        } else {
            alert(res.error);
            btn.innerText = "Try Again";
        }
    } catch(e) {
        alert("Server Error");
    }
}

function toggleAdmin() {
    document.getElementById("adminPanel").classList.toggle("hidden");
}

async function adminLogin() {
    const email = document.getElementById("admEmail").value;
    const pass = document.getElementById("admPass").value;
    
    const req = await fetch('/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password: pass})
    });
    const res = await req.json();
    if(res.success) {
        alert("Logged in!");
        document.getElementById("botCount").innerText = res.count;
    } else {
        alert("Invalid Creds");
    }
}

async function sendBroadcast() {
    const msg = document.getElementById("broadcastTxt").value;
    const email = document.getElementById("admEmail").value;
    const pass = document.getElementById("admPass").value;
    
    await fetch('/admin/broadcast', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password: pass, message: msg})
    });
    alert("Sent!");
}
