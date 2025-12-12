import {db} from "../firebase/firebase-config.js";
import { normalizeDate, normalizeName, generateIntervalId, saveWorkerDTR} from "../utils/util-functions.js";

export async function saveWorkerTimeRecords(workers,week) {
  const updates = {};

    const intervalPromises = workers.map(w =>{
      return generateIntervalId(`time_records/${week}/${normalizeName(w.name)}/${normalizeDate(w.date)}/intervalCounter`);
    });

    const intervalIds = await Promise.all(intervalPromises);

    for(let i = 0; i < workers.length; i++){
      const w = workers[i];
      const name = normalizeName(w.name);
      const date = normalizeDate(w.date);
      const intervalId = intervalIds[i];

      const basePath = `time_records/${week}/${name}/${date}`;
      updates[`${basePath}/originalName`] = w.name.toUpperCase();
      updates[`${basePath}/dipslayTI`] = updates[`${basePath}/displayTI`] ?? w.timein;
      updates[`${basePath}/dipslayTO`] = w.timeout;
      updates[`${basePath}/intervals/${intervalId}`] = {
        TI: w.timein,
        TO: w.timeout
      };
      
      const dtrPath = `dtr_records/${week}/${name}/${date}`;
      const existing = updates[dtrPath] ?? { hours: 0, OT: 0, dayEquiv: 0 };
      const newDtr = saveWorkerDTR(w.timein, w.timeout);

      updates[dtrPath] = {
        hours:  existing.hours + newDtr.hours,
        OT:  existing.OT + newDtr.OT,
        dayEquiv:  Math.min(existing.dayEquiv + newDtr.dayEquiv, 1),
      }

    }

    await db.ref().update(updates);

}




