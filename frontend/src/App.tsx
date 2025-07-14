import { useState } from "react";
import "./App.css";
import { API_URL } from "./config";

console.log(API_URL);

function App() {
  const [username, setUsername] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    frequency: Record<string, number>;
  } | null>(null);

  const handleSubmit = async () => {
    if (!file || !username) return alert("Enter username and select file");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          fileName: file.name,
        }),
      });

      const data = await res.json();
      const { uploadUrl } = data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
      });

      if (uploadRes.ok) {
        const intervalId = setInterval(async () => {
          const freqRes = await fetch(`${API_URL}/frequency`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          const freqData = await freqRes.json();
          if (freqRes.ok && freqData && freqData.frequency) {
            setResult(freqData);
            setIsLoading(false);
            clearInterval(intervalId);
          }
        }, 3000);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      setIsLoading(false);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Word Frequency Analyzer</h2>
        <div className="form-group">
          <input
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="file-input">
            <span>{file ? file.name : "Choose a file"}</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
            />
          </label>
        </div>
        <button
          className="button"
          onClick={handleSubmit}
          disabled={isLoading || !username || !file}
        >
          {isLoading ? "Processing..." : "Upload"}
        </button>

        {isLoading && (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Analyzing your document...</p>
          </div>
        )}

        {result?.frequency && !isLoading && (
          <>
            <h3>Word Frequency Results</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.frequency)
                    .sort(([, a], [, b]) => b - a)
                    .map(([word, count]) => (
                      <tr key={word}>
                        <td>{word}</td>
                        <td>{count as number}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
