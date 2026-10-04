// ===============================
// GEMINI CHATBOT CONFIGURATION
// ===============================

const API_KEY = "AQ.Ab8RN6IPsSGVXBZbRqcYVkWWB7vDokh1XRa8IwsuvvLCzLIkuw";

const MODEL = "gemini-3.8-flash";

const API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;


// ===============================
// DOM ELEMENTS
// ===============================

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");


// ===============================
// CONVERSATION HISTORY
// ===============================

let conversationHistory = [];


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;

    // Add user message to screen
    addMessage("You", message, true);

    // Add user message to Gemini history
    conversationHistory.push({
        role: "user",
        parts: [
            {
                text: message
            }
        ]
    });

    // Clear input
    messageInput.value = "";

    // Disable send button
    sendBtn.disabled = true;

    // Show loading
    const loadingMessage = addLoadingMessage();

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY
            },

            body: JSON.stringify({

                contents: conversationHistory,

                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }

            })

        });


        const data = await response.json();

        console.log("Gemini API Response:", data);


        // Remove loading message
        loadingMessage.remove();


        // ===============================
        // ERROR HANDLING
        // ===============================

        if (!response.ok) {

            console.error("Gemini API Error:", data);

            const errorMessage =
                data?.error?.message ||
                `Request failed with status ${response.status}`;

            addMessage(
                "Gemini",
                "❌ " + errorMessage,
                false
            );

            // Remove failed user message from history
            conversationHistory.pop();

            return;
        }


        // ===============================
        // GET GEMINI RESPONSE
        // ===============================

        const reply =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("");


        if (!reply) {

            addMessage(
                "Gemini",
                "❌ Gemini returned an empty response.",
                false
            );

            return;
        }


        // ===============================
        // ADD MODEL RESPONSE TO HISTORY
        // ===============================

        conversationHistory.push({
            role: "model",
            parts: [
                {
                    text: reply
                }
            ]
        });


        // Show Gemini response
        addMessage("Gemini", reply, false);

    }

    catch (error) {

        console.error("Network Error:", error);

        loadingMessage.remove();

        // Remove failed user message
        conversationHistory.pop();

        addMessage(
            "Gemini",
            "❌ Network error. Please check your internet connection and try again.",
            false
        );

    }

    finally {

        sendBtn.disabled = false;

        messageInput.focus();

    }
}


// ===============================
// ADD MESSAGE TO CHAT
// ===============================

function addMessage(sender, text, isUser) {

    const messageDiv = document.createElement("div");

    messageDiv.className =
        isUser
            ? "message user-message"
            : "message bot-message";


    // Avatar
    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
        isUser ? "👤" : "✦";


    // Message content
    const content = document.createElement("div");

    content.className = "message-content";


    // Sender name
    const senderDiv = document.createElement("div");

    senderDiv.className = "sender";

    senderDiv.textContent = sender;


    // Message text
    const textDiv = document.createElement("div");

    textDiv.className = "text";

    textDiv.textContent = text;


    // Build message
    content.appendChild(senderDiv);

    content.appendChild(textDiv);

    messageDiv.appendChild(avatar);

    messageDiv.appendChild(content);

    chatBox.appendChild(messageDiv);


    // Scroll
    scrollToBottom();
}


// ===============================
// LOADING MESSAGE
// ===============================

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


// ===============================
// SCROLL TO BOTTOM
// ===============================

function scrollToBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;

}


// ===============================
// SEND BUTTON
// ===============================

sendBtn.addEventListener("click", function () {

    sendMessage();

});


// ===============================
// ENTER KEY
// ===============================

messageInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }

});


// ===============================
// CLEAR CHAT
// ===============================

clearBtn.addEventListener("click", function () {

    conversationHistory = [];

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

    messageInput.focus();

});
