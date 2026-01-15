import { deleteWorkerTimeRecords } from "../firebase/services.js"; // never forget this .js 
import "dotenv/config";
export default async function deleteWorkerHandler(req, res){    
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "DELETE"){
    return res.status(405).json({ error: "Method not allowed!"});
  }

  const {name, week} = req.query;

  if(!name || !week){
    return res.status(400).json({error: "Request cannot be empty!"});
  }

  try {
    
    await deleteWorkerTimeRecords(name, week);

    res.status(200).json({ message: "Row deleted Successfully!"});

  } catch (error) {
    res.status(500).json({ error: "Row Deletion Failed!"});
  }


}