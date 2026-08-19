document.getElementById("noteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  await fetch("/addNote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content })
  });

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  loadNotes();
});

async function loadNotes() {
  const res = await fetch("/notes");
  const notes = await res.json();
  const list = document.getElementById("notesList");
  list.innerHTML = notes.map(n => `<div class="note"><h3>${n.title}</h3><p>${n.content}</p></div>`).join("");
}

loadNotes();
