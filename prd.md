### **Academic Agent: Project Blueprint**

**Academic Agent** is a specialized, agentic platform engineered to eliminate the high-volume, low-value administrative friction inherent in the engineering curriculum. It transforms passive resources into active study engines and automates the production of complex technical documentation.

---

---

## **1. Core System Features**

| Feature | Description | Engineering Value |
| --- | --- | --- |
| **PYQ Study Engine** | Analyzes Syllabus + Previous Year Questions (PYQs) to map topic frequency. | Direct exam targeting based on statistical probability. |
| **Interrogation Mode** | An active-recall agent that proactively quizzes the user based on uploaded notes. | Shifts learning from passive reading to active cognitive retrieval. |
| **Report Architect** | Converts technical codebases or raw briefs into formatted project reports. | Automates the 10-15 hours typically lost to manual documentation formatting. |
| **Obsidian Sync** | Seamlessly exports all AI outputs as perfectly formatted `.md` files. | Eliminates vendor lock-in; integrates into local knowledge bases. |

---

## **2. Design Identity: "Glassmorphic Tech"**

The UI is designed to feel like a premium IDE—functional, distraction-free, and technically sophisticated.

* **Typography:** **JetBrains Mono** exclusively. This monospaced font provides a clinical, precise look that aligns with a developer's environment.
* **Visual Style:** Rounded **16px corners** on all primary containers. We use **Glassmorphism** (backdrop-blur + translucent backgrounds) to create a floating, layered depth.
* **Palette:** Muted neutrals. We avoid high-contrast blacks and whites in favor of soft grays (`#EAEAEA`) and slate blues (`#7D93A1`) to prevent eye strain during long-duration usage.

---

## **3. Technical Architecture**

The system follows a unified **MERN Stack** (MongoDB, Express, React, Node) architecture to ensure maximum iteration speed during the hackathon.

1. **Frontend (React + Vite):** A reactive SPA (Single Page Application) utilizing `Framer Motion` for glass-panel transitions and `Tailwind CSS` for utility-driven styling.
2. **Backend (Node + Express):** An asynchronous API layer handling multi-part file streams via `Multer` and PDF text extraction via `pdf-parse`.
3. **Intelligence Layer (Gemini/OpenAI):** Specialized system prompts convert raw academic text into structured JSON blueprints and Markdown reports.
4. **Persistence (MongoDB):** A document-oriented database that allows for highly flexible storage of unstructured AI generations without schema migration overhead.

---

## **4. Operational Workflow**
|
                           HTTP / WebS
1. **Context Ingestion:** Phase 01.
User uploads a Syllabus PDF and at least three years of PYQ PDFs. The backend extracts text and builds a unified context window.


2. **Pattern Mapping:** Phase 02.
The AI Agent cross-references the syllabus modules against the question frequency in the PYQs to assign a "Probability Score" to every topic.


3. **Active Engagement:** Phase 03.
The user enters 'Interrogation Mode'. The AI surfaces targeted questions from the blueprint. The user responds, and the AI provides a real-time technical evaluation and grade.


4. **Documentation Finalization:** Phase 04.
The user triggers the 'Architect' to convert their study history or project code into a formal report, then exports the entire session to Obsidian via Markdown.


---

> **Hackathon Strategy:** The "Wow" factor lies in the **Interrogation Mode**. By demonstrating a machine that *asks* you questions rather than just answering them, you prove that Academic Agent is a proactive tool, not just another chatbot wrapper.