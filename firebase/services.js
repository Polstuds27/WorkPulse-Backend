import {db} from "../firebase/firebase-config.js";
import { normalizeDate, normalizeName, calculateHours, calculateOT, calculateDayEquiv} from "../utils/util-functions.js";

export async function saveWorkerTimeRecords(workers,week) {
  const updates = {};


  /**
   * 
   * TODO 
   * 1: DITCH INTERVALS THEY SUCK /
   * 2: DO UDPATE
   * 3: DO DELETION
   * 4: DO USER AUTH
   * 5: TESTING
   */


    for(let i = 0; i < workers.length; i++){
      const w = workers[i];
      const name = normalizeName(w.name);
      const date = normalizeDate(w.date);

      const basePath = `time_records/${week}/${name}/${date}`;
      const dtrPath = `dtr_records/${week}/${name}/${date}`;

      const [snapshotTime, snapshotDTR] = await Promise.all([
      db.ref(basePath).once("value"),
      db.ref(dtrPath).once("value")
      ]);

      const existingTimeData = snapshotTime.val() || {};
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

      const prevHours = existingDTR.hours;
      const currentHours = calculateHours(w.timein, w.timeout);

      const totalHours = prevHours + currentHours;

      updates[dtrPath] = {
        hours: totalHours || 0,
        OT:  calculateOT(totalHours) || 0,
        dayEquiv: calculateDayEquiv(totalHours) || 0,
      };

    }

    await db.ref().update(updates);

}




