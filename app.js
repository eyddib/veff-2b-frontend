import axios from "axios";

/* =========================
   CONFIG
========================= */
const API_BASE = "https://veff-2026-quotes.netlify.app/api/v1";
const LOCAL_API = "http://localhost:3000/api/v1";

/* =========================
   QUOTE FEATURE
========================= */

/**
 * Fetch a quote from the API
 * @param {string} category - quote category
 */
const loadQuote = async (category = "general") => {
  try {
    const response = await axios.get(`${API_BASE}/quotes`, {
      params: { category },
    });

    const quote = response.data;

    const blockquote = document.getElementById("quote-text");
    const figcaption = document.getElementById("quote-author");

    blockquote.textContent = quote.text ?? quote.quote ?? quote.content ?? "";
    figcaption.textContent = quote.author ?? "";

    return quote;
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
};

const wireQuoteEvents = () => {
  const select = document.getElementById("quote-category-select");
  const button = document.getElementById("new-quote-btn");

  if (select) {
    select.addEventListener("change", async (event) => {
      await loadQuote(event.target.value);
    });
  }

  if (button && select) {
    button.addEventListener("click", async () => {
      await loadQuote(select.value);
    });
  }
};

const loadTasks = async () => {
  try {
    const res = await axios.get(`${LOCAL_API}/tasks`);
    const list = document.querySelector(".task-list");
    if (!list) return;

    list.innerHTML = "";

    res.data.forEach((t) => {
      const li = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = t.finished === 1;

      checkbox.addEventListener("change", async () => {
        try {
          await axios.patch(`${LOCAL_API}/tasks/${t.id}`, {
            finished: checkbox.checked ? 1 : 0,
          });
        } catch (err) {
          console.error(err);
        }
      });

      li.appendChild(checkbox);
      li.append(" " + t.task);

      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
};

const addTask = async (text) => {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return;

  try {
    await axios.post(`${LOCAL_API}/tasks`, { task: trimmed });
    await loadTasks();
  } catch (err) {
    console.error(err);
  }
};

const wireTaskEvents = () => {
  const input = document.getElementById("new-task");
  const btn = document.getElementById("add-task-btn");
  if (!input || !btn) return;

  btn.addEventListener("click", async () => {
    await addTask(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await addTask(input.value);
      input.value = "";
    }
  });
};

let savedNotes = "";

const loadNotes = async () => {
  try {
    const res = await axios.get(`${LOCAL_API}/notes`);
    const textarea = document.getElementById("notes-text");
    if (!textarea) return;

    savedNotes = res.data?.notes ?? "";
    textarea.value = savedNotes;
  } catch (err) {
    console.error(err);
  }
};

const wireNotes = () => {
  const textarea = document.getElementById("notes-text");
  const btn = document.getElementById("save-notes-btn");
  if (!textarea || !btn) return;

  btn.disabled = true;

  textarea.addEventListener("input", () => {
    btn.disabled = textarea.value === savedNotes;
  });

  btn.addEventListener("click", async () => {
    try {
      await axios.put(`${LOCAL_API}/notes`, { notes: textarea.value });
      savedNotes = textarea.value;
      btn.disabled = true;
    } catch (err) {
      console.error(err);
    }
  });
};


const init = async () => {
  wireQuoteEvents();

  const select = document.getElementById("quote-category-select");
  const category = select?.value || "general";
  await loadQuote(category);

  wireTaskEvents();
  wireNotes();
  await loadTasks();
  await loadNotes();
};

/* =========================
   EXPORT (DO NOT REMOVE)
========================= */

export { init, loadQuote, wireQuoteEvents };

init();