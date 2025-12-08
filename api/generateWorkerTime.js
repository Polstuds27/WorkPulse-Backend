import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import express from "express";
import {db} from "../firebase/firebase-config.js";

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Rounding function
function roundTime(timeStr) {
  let [hourMin, ampm] = timeStr.toLowerCase().split(/(am|pm)/).filter(Boolean);
  let [hour, min] = hourMin.split(":").map(Number);

  if (min <= 15) min = 0;
  else if (min <= 44) min = 30;
  else {
    min = 0;
    hour += 1;
    if (hour > 12) hour -= 12;
  }

  const pad = n => n.toString().padStart(2, "0");
  return `${hour}:${pad(min)}${ampm}`;
}

// Clean AI output
function cleanJSON(str) {
  return str.replace(/```json/gi, "").replace(/```/g, "").trim();
}

// Call Gemini to extract raw times
async function getRawWorkers(text_req) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
Extract all worker names, date, timein, and timeout from this text in JSON:
${text_req}
Return ONLY JSON with this structure:
{
  "workers": [
    { "date": "MM/DD/YY", "timein": "H:MMam/pm", "timeout": "H:MMam/pm", "name": "Worker Name" }
  ]
}
Do NOT round times. Do NOT include markdown or explanations.
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(cleanJSON(result.response.text()));
}

function roundWorkersTimes(workers) {
  return workers.map(w => ({
    ...w,
    timein: roundTime(w.timein),
    timeout: roundTime(w.timeout),
  }));
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[.#$[\]]/g, "");
}

function normalizeDate(date) {
  // converts "07/27/25" → "2025-07-27"
  const [mm, dd, yy] = date.split("/");
  return `20${yy}-${mm}-${dd}`;
}

async function saveWorkerTime(workers) {
  const updates = {};

  workers.forEach(w => {
    const name = normalizeName(w.name);        // armani → armani
    const date = normalizeDate(w.date);        // "07/27/25" → "2025-07-27"

    updates[`time_records/${name}/${date}`] = {
      timeIn: w.timein,
      timeOut: w.timeout,
      originalName: w.name
    };
  });

  console.log("Updates to be sent to Firebase:", updates); // debug
  await db.ref().update(updates);
  console.log("Worker times saved!");
}


app.get("/api", async (req, res) => {
  try {
    const text_req = `July 30 2025
        Timein: 8:45am
        Timeout: 11:27pm
        armani
        jayson
        robert
        kalo
        geybin
        handsel
        paul
        obet`;
    console.time("gen");
    const rawWorkers = await getRawWorkers(text_req);
    console.timeEnd("gen");
    const workersArray = rawWorkers.workers
    const roundedWorkers = roundWorkersTimes(workersArray);
    await saveWorkerTime(roundedWorkers);
    // for save dtr
    res.status(200).json({ workers: roundedWorkers, message: "Success!" });
  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

app.listen(5001, () => {
  console.log("Server started on port 5001");
});
