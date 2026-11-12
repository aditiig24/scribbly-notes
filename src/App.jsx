import "@fontsource/kalam/400.css";
import "@fontsource/patrick-hand/400.css";
import "@fontsource/caveat/400.css";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./App.css";
const hashPassword = async (value) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};
function App() {
 
  const [notes, setNotes] = useState(() => {
  return localStorage.getItem("scribblyNotes") || "";
});
const [password, setPassword] = useState("");

const [isLocked, setIsLocked] = useState(
  Boolean(localStorage.getItem("scribblyPasswordHash"))
);
const [searchQuery, setSearchQuery] = useState("");
const [notebooks, setNotebooks] = useState(() => {
  const saved = localStorage.getItem("scribblyNotebooks");
  return saved ? JSON.parse(saved) : [
    { id: 1, name: "My Notebook" }
  ];
});

const [activeNotebook, setActiveNotebook] = useState(() => {
  return Number(localStorage.getItem("activeNotebook")) || 1;
});
const [notebookNotes, setNotebookNotes] = useState(() => {
  const saved = localStorage.getItem("notebookNotes");
  return saved ? JSON.parse(saved) : {};
});
const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem("scribblyFavorites");
  return saved ? JSON.parse(saved) : [];
});
const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
const [lastEdited, setLastEdited] = useState(() => {
  const saved = localStorage.getItem("scribblyLastEdited");
  return saved ? JSON.parse(saved) : {};
});
useEffect(() => {
  localStorage.setItem("scribblyNotebooks", JSON.stringify(notebooks));
}, [notebooks]);
useEffect(() => {
  localStorage.setItem(
    "scribblyLastEdited",
    JSON.stringify(lastEdited)
  );
}, [lastEdited]);
useEffect(() => {
  setNotebookNotes((prev) => ({
    ...prev,
    [activeNotebook]: notes
  }));
}, [notes, activeNotebook]);
useEffect(() => {
  localStorage.setItem("notebookNotes", JSON.stringify(notebookNotes));
}, [notebookNotes]);

useEffect(() => {
  localStorage.setItem("activeNotebook", activeNotebook);
}, [activeNotebook]);
useEffect(() => {
  localStorage.setItem("scribblyNotes", notes);
}, [notes]);
useEffect(() => {
  setLastEdited((prev) => ({
    ...prev,
    [activeNotebook]: new Date().toISOString()
  }));
}, [notes, activeNotebook]);
   const wordCount = notes.trim()
  ? notes.trim().split(/\s+/).length
  : 0;

const characterCount = notes.length;

const lineCount = notes
  ? notes.split("\n").length
  : 0;
  const searchMatches = searchQuery.trim()
  ? notes.split("\n").filter((line) =>
      line.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : [];
  const highlightText = (text, query) => {
  if (!query.trim()) return text;

  const parts = text.split(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    )
  );
};

  const [font, setFont] = useState("handwriting-one");
  const [ink, setInk] = useState("#2455a4");
  const [paper, setPaper] = useState("lined");
  const [pageSize, setPageSize] = useState("a4");
  const [pageColor, setPageColor] = useState("#fffef9");

  const notebookRef = useRef(null);
  // Automatically divide notes into notebook pages
const linesPerPage = 12;

const allLines = notes.split("\n");

const pages = [];

for (let i = 0; i < allLines.length; i += linesPerPage) {
  pages.push(allLines.slice(i, i + linesPerPage));
}

if (pages.length === 0) {
  pages.push([""]);
}

  // Download notebook as PNG
  const downloadPNG = async () => {
    try {
      const canvas = await html2canvas(notebookRef.current, {
        scale: 2,
        backgroundColor: "#fffef9",
      });

      const link = document.createElement("a");
      link.download = "scribbly-notes.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error(error);
      alert("Unable to download PNG. Please try again.");
    }
  };

  // Download notebook as PDF
  const downloadPDF = async () => {
  try {
    const notebookPages =
      notebookRef.current.querySelectorAll(".paper");

    if (!notebookPages.length) {
      alert("No notebook pages found!");
      const wordCount = notes.trim()
  ? notes.trim().split(/\s+/).length
  : 0;

const characterCount = notes.length;

const lineCount = notes
  ? notes.split("\n").length
  : 0;
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < notebookPages.length; i++) {
      const canvas = await html2canvas(notebookPages[i], {
        scale: 2,
        backgroundColor: "#fffef9",
        useCORS: true
      });

      const image = canvas.toDataURL("image/png");

      const margin = 10;

      const ratio = Math.min(
        (pageWidth - margin * 2) / canvas.width,
        (pageHeight - margin * 2) / canvas.height
      );

      const imageWidth = canvas.width * ratio;
      const imageHeight = canvas.height * ratio;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        image,
        "PNG",
        (pageWidth - imageWidth) / 2,
        (pageHeight - imageHeight) / 2,
        imageWidth,
        imageHeight
      );
    }

    pdf.save("scribbly-notes.pdf");

    alert("PDF downloaded successfully!");

  } catch (error) {
    console.error(error);
    alert("Unable to download PDF. Please try again.");
  }
};
const createNotebook = () => {
  const newNotebook = {
    id: Date.now(),
    name: `Notebook ${notebooks.length + 1}`
  };

  setNotebookNotes((prev) => ({
    ...prev,
    [activeNotebook]: notes,
    [newNotebook.id]: ""
  }));

  setNotebooks((prev) => [...prev, newNotebook]);
  setActiveNotebook(newNotebook.id);
  setNotes("");
};
const switchNotebook = (notebookId) => {
  setNotebookNotes((prev) => ({
    ...prev,
    [activeNotebook]: notes
  }));

  setActiveNotebook(notebookId);
  setNotes(notebookNotes[notebookId] || "");
};
const renameNotebook = () => {
  const newName = prompt("Enter new notebook name:");

  if (!newName || !newName.trim()) return;

  setNotebooks((prev) =>
    prev.map((notebook) =>
      notebook.id === activeNotebook
        ? { ...notebook, name: newName.trim() }
        : notebook
    )
  );
};
const deleteNotebook = () => {
  if (notebooks.length === 1) {
    alert("You must keep at least one notebook!");
    return;
  }
 

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this notebook?"
  );

  if (!confirmDelete) return;

  const updatedNotebooks = notebooks.filter(
    (notebook) => notebook.id !== activeNotebook
  );

  const nextNotebook = updatedNotebooks[0];

  setNotebooks(updatedNotebooks);

  setNotebookNotes((prev) => {
    const updated = { ...prev };
    delete updated[activeNotebook];
    return updated;
  });

  setActiveNotebook(nextNotebook.id);
  setNotes(notebookNotes[nextNotebook.id] || "");
};
 const toggleFavorite = () => {
  setFavorites((prev) =>
    prev.includes(activeNotebook)
      ? prev.filter((id) => id !== activeNotebook)
      : [...prev, activeNotebook]
  );
};

const exportNotebooks = () => {
  const backupData = {
    notebooks,
    notebookNotes,
    favorites,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob(
    [JSON.stringify(backupData, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "scribbly-notes-backup.json";

  link.click();

  URL.revokeObjectURL(url);
};

const setNewPassword = async () => {
  if (!password.trim()) {
    alert("Please enter a password!");
    return;
  }

  const hashedPassword = await hashPassword(password);

  localStorage.setItem(
    "scribblyPasswordHash",
    hashedPassword
  );

  setPassword("");
  setIsLocked(false);

  alert("Password created successfully!");
};

const unlockApp = async () => {
  const enteredHash = await hashPassword(password);

  const savedHash = localStorage.getItem(
    "scribblyPasswordHash"
  );

  if (enteredHash === savedHash) {
    setIsLocked(false);
    setPassword("");
  } else {
    alert("Incorrect password! Try again.");
    setPassword("");
  }
};
const importNotebooks = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const backupData = JSON.parse(e.target.result);

      if (
        !Array.isArray(backupData.notebooks) ||
        !backupData.notebookNotes
      ) {
        alert("Invalid backup file!");
        return;
      }

      setNotebooks(backupData.notebooks);
      setNotebookNotes(backupData.notebookNotes);
      setFavorites(backupData.favorites || []);

      setActiveNotebook(backupData.notebooks[0].id);
      setNotes(
        backupData.notebookNotes[backupData.notebooks[0].id] || ""
      );

      alert("Notebooks imported successfully!");
    } catch (error) {
      alert("Unable to import backup file!");
    }
  };

  reader.readAsText(file);
};

return (
  !localStorage.getItem("scribblyPasswordHash") ? (
    <div className="lock-screen">
      <h1>🔐 Scribbly Notes</h1>
      <h3>Create Your Password</h3>

      <input
        type="password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={setNewPassword}>
        Save Password
      </button>
    </div>
  ) : isLocked ? (
    <div className="lock-screen">
      <h1>🔐 Scribbly Notes</h1>
      <h3>Welcome Back!</h3>

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={unlockApp}>
        Unlock Notes
      </button>
    </div>
  ) : (
    <div className="app">
      <header className="navbar">
        <h1>✍️ Scribbly Notes</h1>
        <div className="notebook-controls">

  <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
    {showFavoritesOnly ? "📚 Show All" : "⭐ Show Favorites"}
  </button>

  <button onClick={toggleFavorite}>
    {favorites.includes(activeNotebook)
      ? "⭐ Remove Favorite"
      : "☆ Add to Favorites"}
  </button>

  <button onClick={renameNotebook}>
    ✏️ Rename Notebook
  </button>

  <button onClick={createNotebook}>
    + Create Notebook
  </button>

  <button onClick={exportNotebooks}>
    📥 Export Notebooks
  </button>

  <button onClick={deleteNotebook}>
    🗑️ Delete Notebook
  </button>

  <label className="import-button">
    📂 Import Notebooks
    <input
      type="file"
      accept=".json,application/json"
      onChange={importNotebooks}
      style={{ display: "none" }}
    />
  </label>

  <select
    value={activeNotebook}
    onChange={(e) => switchNotebook(Number(e.target.value))}
  >
    {notebooks
      .filter((notebook) =>
        !showFavoritesOnly || favorites.includes(notebook.id)
      )
      .map((notebook) => (
        <option key={notebook.id} value={notebook.id}>
          {notebook.name}
        </option>
      ))}
  </select>

</div>
        <span>Turn your thoughts into handwritten notes.</span>
        <p className="last-edited">
  🕒 Last Edited: {
    lastEdited[activeNotebook]
      ? new Date(lastEdited[activeNotebook]).toLocaleString()
      : "Not edited yet"
  }
</p>
      </header>

      <main className="container">
        <section className="welcome">
          <h2>Make your notes beautiful!</h2>
          <p>
            Type your notes and watch them transform into
            beautiful handwritten notebook pages.
          </p>
        </section>

        <section className="workspace">
          <div className="editor">
            <h2>📝 Your Notes</h2>
            <div className="search-box">
  <input
    type="text"
    placeholder="🔍 Search your notes..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  {searchQuery.trim() && (
  <div className="search-results">
    <p>
      {searchMatches.length} matching line(s) found
    </p>

    {searchMatches.length > 0 ? (
      searchMatches.map((line, index) => (
        <div key={index} className="search-result-item">
  {highlightText(line, searchQuery)}
</div>
      ))
    ) : (
      <p>No matching notes found.</p>
    )}
  </div>
)}

  <button onClick={() => setSearchQuery("")}>
    Clear
  </button>
</div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Start typing your notes here..."
            />
            <div className="stats">
              <span>📝 Words: {wordCount}</span>
              <span>🔤 Characters: {characterCount}</span>
              <span>📄 Lines: {lineCount}</span>
              </div>

            <div className="controls">
              <label>Handwriting Style</label>

              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
              >
                <option value="handwriting-one">Style 1 - Caveat</option>
                <option value="handwriting-two">Style 2 - Kalam</option>
                <option value="handwriting-three">Style 3 - Patrick Hand</option>
              </select>

              <label>Ink Colour</label>

              <select
                value={ink}
                onChange={(e) => setInk(e.target.value)}
              >
                <option value="#2455a4">Blue</option>
                <option value="#171717">Black</option>
                <option value="#d62828">Red</option>
                <option value="#16803c">Green</option>
                <option value="#800080">Purple</option>
                <option value="#e91e63">Pink</option>
                <option value="#ff8c00">Orange</option>
                <option value="#795548">Brown</option>
              </select>

              <label>Paper Style</label>

              <select
                value={paper}
                onChange={(e) => setPaper(e.target.value)}
              >
                <option value="lined">Lined Paper</option>
                <option value="plain">Plain Paper</option>
                <option value="grid">Grid Paper</option>
              </select>
              <label>Page Size</label>
<select
  value={pageSize}
  onChange={(e) => setPageSize(e.target.value)}
>
  <option value="a4">A4</option>
  <option value="letter">Letter</option>
  <option value="compact">Compact</option>
</select>
<label>Page Background</label>
<select
  value={pageColor}
  onChange={(e) => setPageColor(e.target.value)}
>
  <option value="#fffef9">Cream</option>
  <option value="#ffffff">White</option>
  <option value="#fff0f3">Soft Pink</option>
  <option value="#cfe8ff">Light Blue</option>
  <option value="#f1f9f0">Light Green</option>
  <option value="#f5f0ff">Lavender</option>
</select>
            </div>
          </div>

          <div className="preview">
            <h2>📖 Live Notebook Preview</h2>

           <div ref={notebookRef} className="pages-container">
  {pages.map((pageLines, pageIndex) => (
    <div
  className={`paper ${paper} ${pageSize}`}
  style={{ backgroundColor: pageColor }}
  key={pageIndex}
>
      <div
  className={`handwriting ${font}`}
  style={{ color: ink }}
>
        {pageLines.map((line, index) => (
          <div key={index}>
            {line || "\u00A0"}
          </div>
        ))}
      </div>

      <div className="page-number">
        Page {pageIndex + 1}
      </div>
    </div>
  ))}
</div>

            <div className="download-buttons">
              <button onClick={downloadPNG}>
                📷 Download PNG
              </button>

              <button onClick={downloadPDF}>
                📄 Download PDF
              </button>
              <button onClick={() => setNotes("")}>
                🗑️ Clear Notes
                </button>
            </div>
          </div>
        </section>
        </main>
    </div>
  )
);
}

export default App;