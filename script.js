const API_KEY = "AQ.Ab8RN6IPsSGVXBZbRqcYVkWWB7vDokh1XRa8IwsuvvLCzLIkuw";

const MODEL = "gemini-3.8-flash";

const API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;


const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");


// Send message
async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;

    // Add user message
    addMessage("You", message, true);

    messageInput.value = "";

    // Disable button
    sendBtn.disabled = true;

    // Show loading
    const loadingMessage = addLoadingMessage();

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: message
                            }
                        ]
                    }
                ]
            })

        });


        const data = await response.json();

        console.log("Gemini Response:", data);


        // Remove loading message
        loadingMessage.remove();


        if (!response.ok) {

            const errorMessage =
                data?.error?.message ||
                "Something went wrong.";

            addMessage(
                "Gemini",
                "❌ " + errorMessage,
                false
            );

            return;
        }


        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!reply) {

            addMessage(
                "Gemini",
                "❌ Gemini did not return a response.",
                false
            );

            return;
        }


        addMessage("Gemini", reply, false);

    }

    catch (error) {

        console.error(error);

        loadingMessage.remove();

        addMessage(
            "Gemini",
            "❌ Network error. Please try again.",
            false
        );

    }

    finally {

        sendBtn.disabled = false;

        messageInput.focus();

    }

}


// Add message to chat
function addMessage(sender, text, isUser) {

    const messageDiv = document.createElement("div");

    messageDiv.className =
        isUser
            ? "message user-message"
            : "message bot-message";


    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
        isUser ? "👤" : "✦";


    const content = document.createElement("div");

    content.className = "message-content";


    const senderDiv = document.createElement("div");

    senderDiv.className = "sender";

    senderDiv.textContent = sender;


    const textDiv = document.createElement("div");

    textDiv.className = "text";

    textDiv.textContent = text;


    content.appendChild(senderDiv);
    content.appendChild(textDiv);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatBox.appendChild(messageDiv);

    scrollToBottom();
}


// Loading message
function addLoadingMessage() {

    const messageDiv = document.createElement("div");

    messageDiv.className = "message bot-message";

    messageDiv.innerHTML = `
        <div class="avatar">✦</div>

        <div class="message-content">

            <div class="sender">
                Gemini
            </div>

            <div class="text">
                Thinking... ⏳
            </div>

        </div>
    `;

    chatBox.appendChild(messageDiv);

    scrollToBottom();

    return messageDiv;
}


// Scroll chat
function scrollToBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;

}


// Send button
sendBtn.addEventListener("click", sendMessage);


// Enter to send
messageInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }

});


// Clear chat
clearBtn.addEventListener("click", function() {

    chatBox.innerHTML = `
        <div class="message bot-message">

            <div class="avatar">
                ✦
            </div>

            <div class="message-content">

                <div class="sender">
                    Gemini
                </div>

                <div class="text">
                    Chat cleared. How can I help you? 👋
                </div>

            </div>

        </div>
    `;

});
