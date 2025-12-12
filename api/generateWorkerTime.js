import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { cleanJSON, roundWorkersTimes,  } from "../utils/util-functions.js";
import { saveWorkerTimeRecords, saveWorkerTimeRecords } from "../firebase/services.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);


async function getRawWorkers(textRequest) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
Extract all worker names, date, timein, and timeout from this text in JSON:
${textRequest}
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


export default async function generateWorkerTimeHandler(req, res){
  
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Method not allowed!" }); 
  }

  const {textRequest, week} = req.body;

  if(!textRequest || !week){
    return res.status(400).json({error: "Request cannot be empty!"});
  }

  try {
    
    const rawWorkers = await getRawWorkers(textRequest);
    const workersArray = rawWorkers.workers;
    const roundedWorkers = roundWorkersTimes(workersArray);
    await saveWorkerTimeRecords(roundedWorkers, week);

    res.status(200).json({ workers: roundedWorkers});
  } catch (error) {
    res.status(500).json({ error: "AI processing failed" });
  }
}
