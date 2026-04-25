class DocumentSummarizer {
  constructor() {
    this.currentFile = null;
    this.currentFileContent = null;
    this.initializeElements();
    this.setupEventListeners();
    this.loadSettings();
  }

  initializeElements() {
    this.elements = {
      aiProvider: document.getElementById("aiProvider"),
      apiKey: document.getElementById("apiKey"),
      summaryLength: document.getElementById("summaryLength"),
      uploadArea: document.getElementById("uploadArea"),
      fileInput: document.getElementById("fileInput"),
      fileInfo: document.getElementById("fileInfo"),
      fileName: document.getElementById("fileName"),
      fileSize: document.getElementById("fileSize"),
      removeFile: document.getElementById("removeFile"),
      summarizeBtn: document.getElementById("summarizeBtn"),
      btnText: document.querySelector(".btn-text"),
      btnLoader: document.querySelector(".btn-loader"),
      resultsSection: document.getElementById("resultsSection"),
      summaryContent: document.getElementById("summaryContent"),
      copyBtn: document.getElementById("copyBtn"),
      downloadBtn: document.getElementById("downloadBtn"),
      listenBtn: document.getElementById("listenBtn"),
      statusMessage: document.getElementById("statusMessage"),
    };
  }

  setupEventListeners() {
    this.elements.uploadArea.addEventListener("click", () =>
      this.elements.fileInput.click()
    );
    this.elements.fileInput.addEventListener("change", (e) =>
      this.handleSelectFile(e.target.files[0])
    );
    this.elements.uploadArea.addEventListener("dragover", (e) =>
      this.handleDragOver(e)
    );
    this.elements.uploadArea.addEventListener("dragleave", (e) =>
      this.handleDragLeave(e)
    );
    this.elements.uploadArea.addEventListener("drop", (e) =>
      this.handleDrop(e)
    );
    this.elements.removeFile.addEventListener("click", () =>
      this.removeFile()
    );
    this.elements.summarizeBtn.addEventListener("click", () =>
      this.summarizeDocument()
    );
    this.elements.copyBtn.addEventListener("click", () =>
      this.copySummary()
    );
    this.elements.downloadBtn.addEventListener("click", () =>
      this.downloadSummary()
    );
    this.elements.listenBtn.addEventListener("click", () =>
      this.textToSpeech()
    );
    this.elements.aiProvider.addEventListener("change", () =>
      this.saveSettings()
    );
    this.elements.apiKey.addEventListener("input", () =>
      this.saveSettings()
    );
    this.elements.summaryLength.addEventListener("change", () =>
      this.saveSettings()
    );
  }

  loadSettings() {
    const provider = localStorage.getItem("aiProvider");
    const apiKey = localStorage.getItem("apiKey");
    const length = localStorage.getItem("summaryLength");

    if (provider) this.elements.aiProvider.value = provider;
    if (apiKey) this.elements.apiKey.value = apiKey;
    if (length) this.elements.summaryLength.value = length;

    this.updateSummarizeButton();
  }

  saveSettings() {
    localStorage.setItem("aiProvider", this.elements.aiProvider.value);
    localStorage.setItem("apiKey", this.elements.apiKey.value);
    localStorage.setItem("summaryLength", this.elements.summaryLength.value);

    this.updateSummarizeButton();
  }

  handleDragOver(e) {
    e.preventDefault();
    this.elements.uploadArea.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.elements.uploadArea.classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.elements.uploadArea.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      this.handleSelectFile(e.dataTransfer.files[0]);
    }
  }

  async handleSelectFile(file) {
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      this.showStatus("Invalid file type. Please select PDF or DOCX.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showStatus("File size exceeds 10MB limit.", "error");
      return;
    }

    this.currentFile = file;
    this.showFileDetails(file);
    this.showStatus("Extracting text from document...", "info");

    try {
      if (file.type === "application/pdf") {
        this.currentFileContent = await this.extractTextFromPdf(file);
      } else {
        this.currentFileContent = await this.extractTextFromDocx(file);
      }
      if (!this.currentFileContent || this.currentFileContent.length < 50) {
        this.showStatus("Failed to extract meaningful content.", "error");
        this.removeFile();
      } else {
        this.updateSummarizeButton();
        this.showStatus("Document loaded successfully.", "success");
      }
    } catch (error) {
      this.showStatus("Error reading file.", "error");
      console.error(error);
      this.removeFile();
    }
  }

  extractTextFromPdf(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const text = content.items.map((item) => item.str).join(" ");
            fullText += text + "\n";
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Error reading PDF file"));
      reader.readAsArrayBuffer(file);
    });
  }

  extractTextFromDocx(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        mammoth
          .extractRawText({ arrayBuffer: reader.result })
          .then((result) => resolve(result.value))
          .catch(reject);
      };
      reader.onerror = () => reject(new Error("Error reading DOCX file"));
      reader.readAsArrayBuffer(file);
    });
  }

  showFileDetails(file) {
    this.elements.fileName.textContent = file.name;
    this.elements.fileSize.textContent = this.formatFileSize(file.size);
    this.elements.fileInfo.style.display = "block";
    this.elements.uploadArea.style.display = "none";
  }

  removeFile() {
    this.currentFile = null;
    this.currentFileContent = null;
    this.elements.fileInfo.style.display = "none";
    this.elements.uploadArea.style.display = "block";
    this.elements.resultsSection.style.display = "none";
    this.updateSummarizeButton();
    this.hideStatus();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  updateSummarizeButton() {
    const hasText = this.currentFileContent && this.currentFileContent.length > 0;
    const hasApiKey = this.elements.apiKey.value.trim().length > 0;
    this.elements.summarizeBtn.disabled = !hasText || !hasApiKey;
  }

  async summarizeDocument() {
    if (!this.currentFileContent) {
      this.showStatus("Please upload a document first.", "error");
      return;
    }
    if (!this.elements.apiKey.value.trim()) {
      this.showStatus("Please enter your API key.", "error");
      return;
    }

    this.setLoading(true);
    this.showStatus("Generating summary...", "info");

    try {
      let summary = "";
      const provider = this.elements.aiProvider.value;
      const apiKey = this.elements.apiKey.value.trim();
      const length = this.elements.summaryLength.value;

      if (provider === "openai") {
        summary = await this.callOpenAI(apiKey, this.currentFileContent, length);
      } else if (provider === "gemini") {
        summary = await this.callGemini(apiKey, this.currentFileContent, length);
      }

      if (!summary) {
        throw new Error("No summary received.");
      }

      this.displaySummary(summary);
      this.showStatus("Summary generated successfully.", "success");
    } catch (error) {
      this.showStatus("Error generating summary: " + error.message, "error");
    } finally {
      this.setLoading(false);
    }
  }

  async callOpenAI(apiKey, text, length) {
    const lengthDesc = { short: "in 2-3 sentences", medium: "in 1 paragraph", long: "in 2-3 paragraphs" };
    const prompt = `Please summarize the following document ${lengthDesc[length]}: \n\n${text}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type":"application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: length === "short" ? 150 : length === "medium" ? 300 : 600,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const resJson = await response.json();
      throw new Error(resJson.error?.message || "OpenAI API error.");
    }

    const resJson = await response.json();
    return resJson.choices[0].message.content.trim();
  }

  async callGemini(apiKey, text, length) {
    const lengthDesc = { short: "in 2-3 sentences", medium: "in 1 paragraph", long: "in 2-3 paragraphs" };
    const prompt = `Please summarize the following document ${lengthDesc[length]}: \n\n${text}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: length === "short" ? 150 : length === "medium" ? 300 : 600 },
      }),
    });

    if (!response.ok) {
      const resJson = await response.json();
      throw new Error(resJson.error?.message || "Gemini API error.");
    }

    const resJson = await response.json();
    return resJson.candidates[0].content.parts[0].text.trim();
  }

  displaySummary(text) {
    this.elements.summaryContent.textContent = text;
    this.elements.resultsSection.style.display = "block";
    this.elements.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  copySummary() {
    if (!this.elements.summaryContent.textContent) return;
    navigator.clipboard.writeText(this.elements.summaryContent.textContent)
      .then(() => this.showStatus("Summary copied to clipboard.", "success"))
      .catch(() => this.showStatus("Failed to copy summary.", "error"));
  }

  downloadSummary() {
    const text = this.elements.summaryContent.textContent;
    if (!text) return;
    const filename = this.currentFile ? `${this.currentFile.name.split('.')[0]}_summary.txt` : "summary.txt";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showStatus("Summary downloaded.", "success");
  }

  textToSpeech() {
    const text = this.elements.summaryContent.textContent.trim();
    if (!text) {
      this.showStatus("No summary to read.", "error");
      return;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      this.elements.listenBtn.textContent = "🔊 Listen";
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      this.elements.listenBtn.textContent = "🔊 Listen";
    };
    this.elements.listenBtn.textContent = "⏹ Stop";

    speechSynthesis.speak(utterance);
  }

  setLoading(loading) {
    if (loading) {
      this.elements.btnText.style.display = "none";
      this.elements.btnLoader.style.display = "inline";
      this.elements.summarizeBtn.disabled = true;
    } else {
      this.elements.btnText.style.display = "inline";
      this.elements.btnLoader.style.display = "none";
      this.updateSummarizeButton();
    }
  }

  showStatus(message, type) {
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.className = `status-message ${type}`;
    this.elements.statusMessage.style.display = "block";
    if (type === "success" || type === "info") {
      setTimeout(() => this.hideStatus(), 5000);
    }
  }

  hideStatus() {
    this.elements.statusMessage.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  new DocumentSummarizer();
});

document.querySelector(".hero-cta").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("upload-section").scrollIntoView({ behavior: "smooth" });
});
