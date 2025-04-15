import { useState } from "react";
import axios from "axios";
import { Bot, FileText, Loader2, Send, Plus, X } from "lucide-react";

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { text: "Hello! Upload a document and I'll summarize it into a PPT 📄", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState("");

  const toggleMode = () => setMode(prev => (prev === "chat" ? "ppt" : "chat"));

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const clearFile = () => setFile(null);

  const getHelperPrompt = () => {
    if (mode === "chat" && file) {
      return `help me to summarize this file ${file.name}...`;
    } else if (mode === "ppt") {
      return `help me to generate ppt for this text`;
    }
    return "";
  };

  const getFullPrompt = () => {
    let helper = "";

    if (mode === "chat" && file) {
      helper =
        `help me to summarize this file ${file.name} ` +
        "(and most importantly generate a response with no document formatting, small html formatting tags like <b>,<ul><li>,<i>,<br/> allowed only)";
    } else if (mode === "ppt") {
      helper =
        "Create slides using markdown format with clear slide separation like '## Slide 1', each having a '**Title**:', followed by bullet points and markdown tables if needed. Do not add slide notes or intro text.";
    }

    return `${helper}\n${input}`;
  };
  const cleanBoxedContent = (text) => {
    const match = text.match(/\\boxed\{(?:```markdown)?([\s\S]*?)(?:```)?\}/);
    return match ? match[1].trim() : text;
  };
  const sendMessage = async () => {
    setLoading(true);
    if (!input.trim() && !file) return;

    const userMsg = file ? `📄 ${file.name}` : input;
    setMessages((prev) => [...prev, { text: userMsg, sender: "user", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

    let formData = new FormData();

    const fullPrompt = getFullPrompt();
    if (mode === "chat") {
      if (file) formData.append("file", file);
      formData.append("prompt", fullPrompt);
      formData.append("last_response", lastResponse);
    } else if (mode === "ppt") {
      formData.append("summary", fullPrompt);
    }
    const endpoint = mode === "chat" ? "chat" : "generate-ppt";
    const placeholder = { text: "⏳ Processing...", sender: "bot", id: Date.now() };
    setMessages((prev) => [...prev, placeholder]);

    setFile(null);
    setInput("");
    try {
      // const res = await axios.post(`http://127.0.0.1:8000/api/${endpoint}/`, formData);
      const res = await axios.post(`http://127.0.0.1:8000/api/${endpoint}/`, formData);
      // const updatedText = res.data.summary || res.data.message || "Done!";
      const updatedText = cleanBoxedContent(
        res.data.summary || res.data.message || "Done!"
      );
      // const pptLink = res.data.ppt_url;
      const pptLink = res.data.ppt_url
        ? `http://127.0.0.1:8000${res.data.ppt_url}`
        : null;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholder.id
            ? {
              ...msg,
              text: pptLink ? "PPT Ready! Click to download:" : updatedText,
              link: pptLink
            }
            : msg
        )
      );

      if (res.data.summary) setLastResponse(res.data.summary);
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholder.id
            ? { ...msg, text: "❌ Error: " + error.message }
            : msg
        )
      );
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#121212", color: "white" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <header style={{
  padding: "16px",
  backgroundColor: "#1e1e1e",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  fontWeight: "bold"
}}>
  <div>{mode === "chat" ? "💬 AI Chat Summarizer" : "📄 PPT Generator"}</div>

  <div style={{
    position: "absolute",
    right: "16px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }}>
      <a
      href="https://your-link.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#0af", textDecoration: "none" }}
    >
      Manual
    </a>
    👤 <span>Username</span>
  
  </div>
</header>


        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  padding: "10px",
                  maxWidth: "60%",
                  borderRadius: "12px",
                  backgroundColor: msg.sender === "user" ? "#007bff" : "#333",
                  color: "white",
                  whiteSpace: "pre-wrap",
                  position: "relative"
                }}
              >
                {msg.link ? (
                  <a href={msg.link} download style={{ color: "white", textDecoration: "none" }}>
                    📥 Download PPT
                  </a>
                ) : (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "12px", color: "#ccc" }}>
                      {msg.sender === "bot" ? (
                        <>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text);
                              const updated = [...messages];
                              updated[index].copied = true;
                              setMessages(updated);
                              setTimeout(() => {
                                updated[index].copied = false;
                                setMessages([...updated]);
                              }, 2000);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#aaa",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            {msg.copied ? "Copied!" : "Copy"}
                          </button>
                          <span>{msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                      ) : (
                        <span>{msg.timestamp}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {/* {loading && (
            <div style={{ textAlign: "center", color: "#bbb", fontSize: "14px" }}>
              <Loader2 size={20} className="spinner" /> Connecting With Server...
            </div>
          )} */}
        </div>

        {/* Bottom Section */}
        <div style={{ padding: "16px", backgroundColor: "#1e1e1e", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Dynamic Helper Prompt */}
          {file && (
            <div
              style={{
                backgroundColor: "#2f2f2f",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#eee"
              }}
            >
              {getHelperPrompt()}
              <X size={16} onClick={clearFile} style={{ cursor: "pointer", marginLeft: "10px" }} />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Mode Toggle Icon */}
            <div
              onClick={toggleMode}
              style={{
                backgroundColor: "#2f2f2f",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              {mode === "chat" ? <Bot color="white" size={20} /> : <FileText color="white" size={20} />}
            </div>

            {/* File Upload */}
            {mode === "chat" && (
              <label style={{ cursor: "pointer" }}>
                <Plus size={20} color="white" />
                <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
              </label>
            )}

            {/* Multiline Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder={mode === "chat" ? "Ask something or upload a file..." : "Paste summary to convert into PPT..."}
              style={{
                flex: 1,
                resize: "none",
                padding: "10px",
                backgroundColor: "#333",
                color: "white",
                borderRadius: "8px",
                border: "none"
              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#555" : "#007bff",
                padding: "10px",
                borderRadius: "50%",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? <Loader2 size={20} color="white" className="spinner" /> : <Send size={20} color="white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
