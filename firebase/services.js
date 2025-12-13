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
      const dtrPath = `dtr_records/${week}/${name}/${date}`;

      const snapshotTime = await db.ref(basePath).once("value");
      const existingTimeData = snapshotTime.val() || {};


      const snapshotDTR = await db.ref(dtrPath).once("value");
      const existingDTR = snapshotDTR.val() || { hours: 0, OT: 0, dayEquiv: 0 };


      const displayTI = existingTimeData.displayTI 
        ? existingTimeData.displayTI > w.timein
         ? existingTimeData.displayTI 
         : w.timein 
         : w.timein;

      const displayTO = existingTimeData.displayTO 
        ? existingTimeData.displayTO < w.timeout
         ? existingTimeData.displayTO 
         : w.timeout 
         : w.timeout;   

      updates[`${basePath}/originalName`] = w.name.toUpperCase();
      updates[`${basePath}/displayTI`] = displayTI;
      updates[`${basePath}/displayTO`] = displayTO;
      updates[`${basePath}/intervals/${intervalId}`] = {
        TI: w.timein,
        TO: w.timeout
      };
      
      
      const newDtr = saveWorkerDTR(w.timein, w.timeout);

      updates[dtrPath] = {
        hours:  existingDTR.hours + newDtr.hours,
        OT:  existingDTR.OT + newDtr.OT,
        dayEquiv: existingDTR.dayEquiv >= 1 ? 1 : Math.min(existingDTR.dayEquiv + newDtr.dayEquiv, 1),
      };

    }

    await db.ref().update(updates);

}




