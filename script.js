async function askAI() {
    let userMessage = document.getElementById("userInput").value;
    if (!userMessage) return;

    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
    document.getElementById("userInput").value = "";

    chatBox.innerHTML += `<p><strong>AI:</strong> Thinking... 🤔</p>`;

    try {
        const response = await fetch("https://bot-ppkkhar-production.up.railway.app/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();

        if (!data.reply) {
            chatBox.innerHTML += `<p><strong>AI:</strong> Error fetching response.</p>`;
            return;
        }

        chatBox.innerHTML += `<p><strong>AI:</strong> ${data.reply}</p>`;

    } catch (error) {
        chatBox.innerHTML += `<p><strong>AI:</strong> Server error.</p>`;
        console.error("Fetch Error:", error);
    }
}

document.getElementById("sendBtn").addEventListener("click", askAI);
