To elevate "Academic Agent" from a simple API wrapper to a true **Autonomous Intelligence System**, the platform implements an decoupled, multi-agent architecture. Instead of using a single general LLM prompt, the application deploys specialized, task-oriented agents that run on distinct system instructions.

Here is the technical specification and operational logic for the AI Agent layer of the project.

---

## 1. Agent Architecture Map

The platform orchestrates three specialized agents, coordinated by a central routing handler.

```
                  +--------------------------+
                  |    Central Agent Router  |
                  +-------------+------------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
+---------------+       +---------------+       +---------------+
|  The Blueprint |       |  The Socratic |       |  The Document |
|    Analyst    |       |   Examiner    |       |   Architect   |
+---------------+       +---------------+       +---------------+

```

---

## 2. In-Depth Agent Specifications

### Agent 1: The Blueprint Analyst

* **Operational Objective:** Act as an expert academic board member who evaluates curricula and predicts examination trends.
* **System Prompt Persona:** > *"You are a senior university academic evaluator and statistical curriculum analyst. Your task is to ingest unstructured syllabus text and past examination questions to find core thematic overlaps. You strip away non-essential introductory topics and return a structured, hierarchical mapping of high-probability modules sorted strictly by statistical recurrence."*
* **Input Data Matrix:** Clean text string from `Syllabus.pdf` + Aggregated text string array from `PYQ_1.pdf`, `PYQ_2.pdf`, `PYQ_3.pdf`.
* **Execution Logic:** 1. Parses the syllabus array to build a structural catalog of required modules.
2. Runs a phrase-matching and semantic clustering loop over the PYQ dataset to count keyword occurrences (e.g., counting how many times "RSA Algorithm" appears across 5 years of data).
3. Calculates a raw **Probability Score** for each topic based on frequency distribution.
4. Outputs a strictly verified JSON structure containing module names, weights, and key sub-concepts to render on the React dashboard.

### Agent 2: The Socratic Examiner (Interrogation Mode)

* **Operational Objective:** Transition the user from passive reading into high-pressure active recall by running a viva-style assessment.
* **System Prompt Persona:**
> *"You are a strict, uncompromising computer science engineering professor conducting a formal oral viva examination. You ask sharp, conceptually deep questions one at a time based on the provided Study Blueprint. You do not provide open-ended guidance. You analyze the student's response for technical accuracy, offer a definitive grade, outline the precise gap in their knowledge, and immediately progress to the next sequential question."*


* **Input Data Matrix:** The active JSON object from the Blueprint Analyst + The user's real-time textual inputs from the chat window terminal.
* **Execution Logic:**
1. Formulates a targeted question focusing on the highest-weighted topic from the blueprint.
2. Waits for the user's string payload from the client terminal interface.
3. Evaluates the text against strict engineering parameters (e.g., checking if the user correctly mentioned "modular exponentiation" when describing RSA).
4. Dynamically recalibrates its internal prompt to adjust difficulty based on the historical performance tracker stored in the `document_states` collection.



### Agent 3: The Document Architect

* **Operational Objective:** Automate technical reporting by restructuring raw code documentation into industry-standard, formal project engineering files.
* **System Prompt Persona:**
> *"You are an elite principal systems engineer and technical writer. Your goal is to transform messy code snippets, file trees, and quick technical briefs into formal, publication-ready engineering project reports. You strictly avoid informal language and the repetitive layouts of daily lab logs. You automatically structure the document into System Specifications, Functional Implementations, Architecture Maps, and Dependency Trees, rendering the final copy in highly optimized Markdown."*


* **Input Data Matrix:** Text files containing codebase context, route lists, database schemas, or loose markdown notes.
* **Execution Logic:**
1. Analyzes the provided technical footprint to understand the application layout (frontend routes, middleware configurations, backend model files).
2. Autonomously generates systemic overviews detailing architecture layers, tracking how data flows through components.
3. Standardizes the layout into clean Markdown text modules.
4. Applies specific tagging and link references into the file strings, preparing the output for instant integration into knowledge systems like Obsidian.



---

## 3. The Hackathon Presentation Narrative

When you demo this project to the Training and Placement Office or corporate judges, frame the AI logic with this pitch line:

> *"We didn't build another standard chat interface to summarize paragraphs. We built an autonomous assembly line of specialized agents. One acts as a data analyst to predict what is on your exam; the second converts into an aggressive professor to pressure-test your knowledge; the third works as a technical writer to automate your engineering reports. It is an end-to-end framework designed to replace cognitive busywork with optimized, actionable code outputs."*