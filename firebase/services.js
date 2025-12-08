import {db} from "../firebase/firebase-config.js";
import { normalizeDate, normalizeName } from "../utils/util-functions.js";

export async function saveWorkerTime(workers) {
  const updates = {};

  workers.forEach(w => {
    const name = normalizeName(w.name);        
    const date = normalizeDate(w.date);        

    updates[`time_records/${name}/${date}`] = {
      timeIn: w.timein,
      timeOut: w.timeout,
      originalName: w.name
    };
  });

  console.log("Updates to be sent to Firebase:", updates); 
  await db.ref().update(updates);
  console.log("Worker times saved!");
}