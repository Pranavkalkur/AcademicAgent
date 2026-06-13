To ensure "Academic Agent" can handle large file uploads, process complex text, and serve real-time AI responses without freezing the user interface, it relies on a **decoupled, event-driven MERN architecture**.

By utilizing a unified JavaScript ecosystem, data flows seamlessly from the client-side glass components to the non-relational database collections.

---

## 1. Architectural Blueprint Overview

The system is split into three core layers: the **Client Interface Layer**, the **Application Orchestration Layer**, and the **Data & Intelligence Layer**.

```
+-----------------------------------------------------------------------+
|                       CLIENT INTERFACE LAYER                          |
|  [React.js SPA] --> Shared State Context --> Framer Motion Animations  |
+----------------------------------+------------------------------------+
                                   |
                         Multipart FormData / JSON
                                   |
+----------------------------------v------------------------------------+
|                    APPLICATION ORCHESTRATION LAYER                    |
|  [Express.js App] --> Router Middleware --> Multer (RAM Buffer Storage)|
+----------------------------------+------------------------------------+
                                   |
                  +----------------+----------------+
                  |                                 |
        Mongoose ORM Queries                Secure REST HTTPS
                  |                                 |
+-----------------v----------------+      +---------v-------------------+
|        DATA STORAGE LAYER        |      |      INTELLIGENCE LAYER     |
|   [MongoDB Distributed Cluster]  |      |   [Gemini / OpenAI Engine]  |
+----------------------------------+      +-----------------------------+

```

---

## 2. In-Depth Subsystem Deconstruction

### A. Client Interface Layer (Frontend)

The frontend is built as a single-page application (SPA) optimized for rendering complex, reactive markdown data structures within a frosted-glass workspace environment.

* **State Hydration:** The UI uses React's Context API to maintain a global `AgentState`. This tracks the processing cycle of files (`IDLE` -> `UPLOADING` -> `PARSING` -> `ANALYZING` -> `READY`).
* **Virtual DOM Performance:** Because LLMs return extensive text blocks, rendering complex markdown updates can trigger layout shifts. The client integrates `react-markdown` alongside standard structural code-splitting, isolating the chat and text views to prevent full-screen re-renders.

### B. Application Orchestration Layer (Backend)

The backend functions as a stateless, non-blocking I/O routing hub. It is deliberately designed to offload heavy file-system tasks from the main execution thread.

* **In-Memory File Ingestion:** Traditional servers save file uploads directly to disk, which creates slow read/write bottlenecks. Academic Agent implements `Multer` configured with **Memory Storage**. Uploaded PDF streams are retained entirely within RAM buffers as binary data arrays.
* **Synchronous Text Extraction Isolation:** Once the buffer loads, the file passes to the `pdf-parse` processing engine. The engine reads the binary stream, isolates the text character maps, and drops structural font elements to extract raw, unformatted alphanumeric string matrices.

### C. Data & Intelligence Layer (Database & LLM)

This layer manages the persistence of student historical data and coordinates the agent workflows.

* **Document-Oriented Persistence Strategy:** MongoDB is used because AI engines return rich text data. Traditional relational schemas (like SQL tables) require strict rows and columns, which break if the AI modifies its output structure. MongoDB stores the completed blueprints, transcripts, and reports as native BSON documents, allowing the backend to save highly complex objects instantly.
* **JSON-Schema Mode Constraint:** To ensure the frontend receives predictable data, the backend enforces a strict schema constraint when querying the LLM API. The system wraps prompts with a requirement for strict formatting, forcing the AI engine to return structured data arrays rather than loose, conversational feedback.

---

## 3. Core Component Communication Workflows

### The Syllabus-to-Blueprint Pipeline (Data Lifecycle)

```
[UI Upload Zone] --------> (Binary Buffer) --------> [pdf-parse Engine]
                                                             |
                                                     (Raw Text Strings)
                                                             |
                                                             v
[Client UI Workspace] <--- (Clean JSON) <--- [LLM Analytics Prompt Engine]

```

1. **Ingestion & Staging:** The user uploads files via the frontend. The files are bundled into a `Multipart/FormData` request and sent to the `/api/documents/upload` route.
2. **Text Synthesis:** `Multer` captures the files in memory, and the extraction engine processes them into clean text strings.
3. **Context Construction:** The server combines these text blocks into a single prompt template containing your specific constraints:
```
[System Rule]: You are an advanced engineering academic analyst. 
[Context A - Syllabus]: {Extracted Syllabus Text}
[Context B - Past Exams]: {Extracted PYQ Text}
[Objective]: Cross-reference these documents. Output a structured JSON array 
             specifying recurring themes, frequency weights, and probability mappings.

```


4. **Payload Delivery:** The compiled prompt is sent over HTTPS to the AI API.
5. **State Synchronization:** The server receives the JSON object, updates the document status to `completed` in MongoDB, and pushes the payload back to the client interface, rendering the interactive glass card modules.

---

## 4. Database Schema Specifications

### `users` Collection

Tracks authentication states and identity attributes.

```javascript
{
  _id: ObjectId("666a1b2c3d4e5f6a7b8c9d01"),
  email: "pranav.kalkur@uvce.edu",
  name: "Pranav Kalkur",
  createdAt: ISODate("2026-06-12T10:00:00.000Z")
}

```

### `document_states` Collection

Tracks the extraction lifecycle, metadata layers, and final AI markdown generations.

```javascript
{
  _id: ObjectId("666a1b2c3d4e5f6a7b8c9d02"),
  userId: ObjectId("666a1b2c3d4e5f6a7b8c9d01"),
  type: "pyq", // Enum: ['syllabus', 'pyq', 'codebase_context']
  originalFileName: "CNS_2025_Exam.pdf",
  parsedText: "UNIVERSITY VISVESVARAYA COLLEGE OF ENGINEERING... SUBJECT: CRYPTOGRAPHY...",
  status: "completed", // Enum: ['uploaded', 'processing', 'completed', 'failed']
  aiOutput: "## Cryptography and Network Security High-Probability Blueprint\n\n### 1. RSA Algorithm\n* **Probability:** 87%\n* **Frequency:** Found in 4/5 past papers...",
  metadata: {
    academicYear: "2025",
    detectedTopics: ["RSA Algorithm", "AES Cipher", "Digital Signatures"]
  },
  createdAt: ISODate("2026-06-12T10:05:22.000Z")
}

```
