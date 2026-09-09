const form = document.querySelector("#composer-form");
const input = document.querySelector("#prompt");
const conversation = document.querySelector("#conversation");
const welcome = document.querySelector("#welcome");

const AI_CONFIG = {
  model: "nvidia/nemotron-3.5-content-safety:free",
  endpoint: "http://localhost:8080/v1/askforai", // Add your AI API endpoint here when ready.
  demo: false
};

const demoResponse = `Docker is an open-source containerization platform that packages an application together with its dependencies into a lightweight, isolated container.

### Why Docker is useful

1. **Portability** — the same container can run consistently across development, testing, and production.
2. **Isolation** — applications and their dependencies are separated from one another.
3. **Efficiency** — containers generally use fewer resources than full virtual machines.
4. **Consistency** — the application runs in a predictable environment.
5. **Scalability** — containers are well suited to microservices and cloud deployments.

At a high level, you build a **Docker image**, then run that image as a **container**.`;

function addMessage(role, content) {
  const wrapper = document.createElement("article");

  wrapper.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = content;

  wrapper.appendChild(bubble);
  conversation.appendChild(wrapper);

  wrapper.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

function addThinking() {
  const wrapper = document.createElement("article");

  wrapper.className = "message assistant thinking";
  wrapper.id = "thinking";

  const bubble = document.createElement("div");

  bubble.className = "message-bubble";

  bubble.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  wrapper.appendChild(bubble);
  conversation.appendChild(wrapper);

  wrapper.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

function removeThinking() {
  document.querySelector("#thinking")?.remove();
}

async function askAI(userPrompt) {

  /*
   * Demo mode
   *
   * This allows us to test the UI before connecting
   * the actual AI API.
   */
  if (AI_CONFIG.demo || !AI_CONFIG.endpoint) {

    await new Promise(resolve => {
      setTimeout(resolve, 750);
    });

    return demoResponse;
  }

  /*
   * Actual AI request
   */
  const response = await fetch(AI_CONFIG.endpoint, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      model: AI_CONFIG.model,

      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    })

  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();

  return (
    data.choices?.[0]?.message?.content ||
    "I couldn't generate a response."
  );
}

async function submitPrompt(value) {

  const prompt = value.trim();

  if (!prompt) {
    return;
  }

  /*
   * Once the first question is submitted,
   * hide the welcome screen.
   */
  welcome.style.display = "none";

  input.value = "";
  input.style.height = "auto";

  /*
   * Add user's question
   */
  addMessage("user", prompt);

  /*
   * Show AI thinking animation
   */
  addThinking();

  try {

    const answer = await askAI(prompt);

    removeThinking();

    /*
     * Add AI response
     */
    addMessage("assistant", answer);

  } catch (error) {

    removeThinking();

    addMessage(
      "assistant",
      "I couldn't reach the AI service right now. Please check the API endpoint configuration."
    );

    console.error(error);
  }
}


/*
 * Submit using the Send button
 */
form.addEventListener("submit", event => {

  event.preventDefault();

  submitPrompt(input.value);

});


/*
 * Automatically grow the textarea
 */
input.addEventListener("input", () => {

  input.style.height = "auto";

  input.style.height =
    `${Math.min(input.scrollHeight, 180)}px`;

});


/*
 * Enter = send
 *
 * Shift + Enter = new line
 */
input.addEventListener("keydown", event => {

  if (event.key === "Enter" && !event.shiftKey) {

    event.preventDefault();

    form.requestSubmit();

  }

});


/*
 * Suggested prompts
 */
document
  .querySelectorAll("[data-prompt]")
  .forEach(button => {

    button.addEventListener("click", () => {

      input.value = button.dataset.prompt;

      input.focus();

      input.style.height = "auto";

      input.style.height =
        `${input.scrollHeight}px`;

    });

  });