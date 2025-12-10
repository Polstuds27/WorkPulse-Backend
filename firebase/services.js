import {db} from "../firebase/firebase-config.js";
import { normalizeDate, normalizeName, generateIntervalId } from "../utils/util-functions.js";

export async function saveWorkerTime(workers,week) {
  const updates = {};

    for (const w of workers){
      const name = normalizeName(w.name);        
      const date = normalizeDate(w.date);
    
      const intervalId = await generateIntervalId(`time_records/${week}/${name}/${date}/intervalCounter`);

      updates[`time_records/${week}/${name}/${date}/originalName`] = w.name;
      updates[`time_records/${week}/${name}/${date}/intervals/${intervalId}`] = {
      TI: w.timein,
      TO: w.timeout
      };
    }
    
  await db.ref().update(updates);
}