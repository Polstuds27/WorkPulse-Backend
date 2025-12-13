import "dotenv/config";
import { roundWorkersTimes,  parseWorkerRecords} from "../utils/util-functions.js";
import { saveWorkerTimeRecords } from "../firebase/services.js";

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
    
    const rawWorkers = parseWorkerRecords(textRequest);
    if(rawWorkers.error){
      return res.status(400).json({ error: "Invalid Input" });  
    }
    const workersArray = rawWorkers.workers;
    const roundedWorkers = roundWorkersTimes(workersArray);
    await saveWorkerTimeRecords(roundedWorkers, week);

    res.status(200).json({ workers: roundedWorkers});
  } catch (error) {
    res.status(500).json({ error: "Text Processing Failed" });
  }
}






