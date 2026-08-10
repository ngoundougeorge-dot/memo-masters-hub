import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpen, Plus, Trash2, Loader2, Send, Bot, Sparkles, ListTree, Wand2, Save, PanelRightClose, PanelRightOpen, FileText,
} from "lucide-react";
import api, { apiErr, API } from "../lib/api";
import { Button, Input, Textarea } from "../components/ui";
import { useAuth } from "../context/AuthContext";

const MODES = [
  { key: "improve", label: "Améliorer", icon: Wand2, prompt: "Améliore le texte de mon document." },
  { key: "outline", label: "Générer un plan", icon: ListTree, prompt: "Propose un plan de mémoire détaillé pour ce sujet." },
  { key: "expand", label: "Développer", icon: Sparkles, prompt: "Développe et enrichis le contenu de mon document." },
];

function renderMarkdown(text) {
  // Lightweight markdown-ish rendering for the assistant bubbles.
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = esc(text)
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\s*[-*] (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p>${html}</p>`;
}

export default function Editor() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [active, setActive] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);
  const saveTimer = useRef(null);
  const scrollRef = useRef(null);

  const loadDocs = useCallback(async () => {
    const { data } = await api.get("/documents");
    setDocs(data);
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      const list = await loadDocs();
      if (list.length > 0) openDoc(list[0]);
      else await createDoc();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  const openDoc = (d) => {
    setActive(d);
    setTitle(d.title);
    setContent(d.content);
    api.get(`/ai/history?document_id=${d.id}`).then(({ data }) => setMessages(data.map((m) => ({ role: m.role, content: m.content }))));
  };

  const createDoc = async () => {
    const { data } = await api.post("/documents", { title: "Nouveau document", content: "" });
    setDocs((prev) => [data, ...prev]);
    setActive(data);
    setTitle(data.title);
    setContent("");
    setMessages([]);
  };

  const deleteDoc = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/documents/${id}`);
    const list = await loadDocs();
    if (active?.id === id) {
      if (list.length) openDoc(list[0]);
      else await createDoc();
    }
    toast.success("Document supprimé");
  };

  const save = useCallback(async (t, c) => {
    if (!active) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/documents/${active.id}`, { title: t, content: c });
      setDocs((prev) => prev.map((d) => (d.id === data.id ? data : d)));
    } catch (e) {
      toast.error(apiErr(e.response?.data?.detail));
    } finally { setSaving(false); }
  }, [active]);

  const scheduleSave = (t, c) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(t, c), 900);
  };

  const onTitle = (e) => { setTitle(e.target.value); scheduleSave(e.target.value, content); };
  const onContent = (e) => { setContent(e.target.value); scheduleSave(title, e.target.value); };

  const runAI = async (message, mode = "chat") => {
    if (streaming) return;
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "user", content: message }, { role: "assistant", content: "" }]);
    try {
      const resp = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("mp_token")}` },
        body: JSON.stringify({ message, mode, document_id: active?.id, context: content }),
      });
      if (!resp.ok || !resp.body) throw new Error("Erreur du serveur IA");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          const line = part.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") continue;
          let text = "";
          try { text = decodeURIComponent(escape(atob(raw))); } catch { text = raw; }
          acc += text;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: acc };
            return next;
          });
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "Désolé, une erreur est survenue. Réessayez." };
        return next;
      });
      toast.error(e.message || "Erreur IA");
    } finally { setStreaming(false); }
  };

  const send = (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    runAI(msg, "chat");
  };

  const insertLast = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
    if (!last) return;
    const next = content ? `${content}\n\n${last.content}` : last.content;
    setContent(next);
    save(title, next);
    toast.success("Réponse insérée dans le document");
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-foreground"><BookOpen className="h-5 w-5 text-primary" /> MémoirePro</Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">{saving ? "Enregistrement…" : "Enregistré"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground md:inline">{user?.name}</span>
          <Button variant="ghost" size="sm" data-testid="editor-nav-client" onClick={() => navigate("/client")}>Espace client</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAssistant((s) => !s)} data-testid="toggle-assistant">
            {showAssistant ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" data-testid="editor-logout" onClick={() => { logout(); navigate("/"); }}>Déconnexion</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Documents sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
          <div className="p-3">
            <Button className="w-full" size="sm" data-testid="new-doc-btn" onClick={createDoc}><Plus className="h-4 w-4" /> Nouveau document</Button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {docs.map((d) => (
              <button key={d.id} onClick={() => openDoc(d)} data-testid="doc-item"
                className={`group mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${active?.id === d.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}>
                <span className="flex items-center gap-2 truncate"><FileText className="h-4 w-4 shrink-0 opacity-70" /><span className="truncate">{d.title || "Sans titre"}</span></span>
                <Trash2 className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-70 hover:!opacity-100 hover:text-destructive" onClick={(e) => deleteDoc(d.id, e)} data-testid="delete-doc-btn" />
              </button>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-border px-6 py-3">
            <Input value={title} onChange={onTitle} data-testid="doc-title" placeholder="Titre du mémoire" className="border-0 bg-transparent px-0 font-serif text-2xl focus:ring-0 h-auto" />
            <div className="mt-2 flex flex-wrap gap-2">
              {MODES.map((m) => (
                <Button key={m.key} variant="secondary" size="sm" data-testid={`ai-mode-${m.key}`} disabled={streaming} onClick={() => { setShowAssistant(true); runAI(m.prompt, m.key); }}>
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => save(title, content)} data-testid="save-btn"><Save className="h-3.5 w-3.5" /> Enregistrer</Button>
            </div>
          </div>
          <Textarea value={content} onChange={onContent} data-testid="doc-content"
            placeholder="Commencez à rédiger votre mémoire ici, ou demandez à l'assistant IA de générer un plan…"
            className="flex-1 resize-none rounded-none border-0 bg-background px-6 py-5 text-[15px] leading-relaxed focus:ring-0" />
        </main>

        {/* AI assistant */}
        {showAssistant && (
          <aside className="flex w-full max-w-sm shrink-0 flex-col border-l border-border bg-card" data-testid="assistant-panel">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg text-foreground">Assistant IA</span>
              <span className="ml-auto text-xs text-muted-foreground">Claude Sonnet 4.6</span>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Posez une question, générez un plan ou demandez à améliorer votre texte. Vos échanges tiennent compte du contenu du document.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground" : "max-w-[92%] rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-sm text-secondary-foreground"} data-testid={`msg-${m.role}`}>
                  {m.role === "assistant" ? (
                    m.content ? <div className="prose-ai" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} /> : <Loader2 className="h-4 w-4 animate-spin" />
                  ) : m.content}
                </div>
              ))}
            </div>
            {messages.some((m) => m.role === "assistant" && m.content) && (
              <div className="border-t border-border px-4 py-2">
                <Button variant="outline" size="sm" className="w-full" data-testid="insert-response-btn" onClick={insertLast} disabled={streaming}>
                  <Plus className="h-3.5 w-3.5" /> Insérer la dernière réponse
                </Button>
              </div>
            )}
            <form onSubmit={send} className="flex items-end gap-2 border-t border-border p-3">
              <Textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} data-testid="assistant-input"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
                placeholder="Écrivez à l'assistant…" className="max-h-32 min-h-[40px] flex-1" />
              <Button type="submit" size="sm" data-testid="assistant-send" disabled={streaming || !input.trim()}>
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
