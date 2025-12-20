
import {db} from "../firebase/firebase-config.js";

export function roundTime(timeStr) {
  let [hourMin, ampm] = timeStr.toLowerCase().split(/(am|pm)/).filter(Boolean);
  let [hour, min] = hourMin.split(":").map(Number);

  if (min <= 10) min = 0;
  else if (min <= 40) min = 30;
  else {
    min = 0;
    hour += 1;
    if (hour > 12) {
      ampm = ampm === "am" ? "pm" : "am";
    } else if (hour === 12) {
      ampm = ampm === "am" ? "pm" : "am";
    }
  
  }

  const pad = n => n.toString().padStart(2, "0");
  return `${hour}:${pad(min)}${ampm}`;
}

export function cleanJSON(str) {
  return str.replace(/```json/gi, "").replace(/```/g, "").trim();
}

export function roundWorkersTimes(workers) {
  return workers.map(w => ({
    ...w,
    timein: roundTime(w.timein),
    timeout: roundTime(w.timeout),
  }));
}

export function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[.#$[\]]/g, "");
}

export function normalizeDate(date) {
  const [mm, dd, yy] = date.split("/");
  return `20${yy}-${mm}-${dd}`;
}

export function calculateHours(timeIn, timeOut){
  const cleanedTI = parseTime(roundTime(timeIn));
  const cleanedTO = parseTime(roundTime(timeOut));

  let workedMinutes = 0;
  if(cleanedTO < cleanedTI) workedMinutes = (24 * 60 - cleanedTI) + cleanedTO 
  else workedMinutes = cleanedTO - cleanedTI;
  
  return workedMinutes / 60;
}


export function calculateOT(hours){
  let ot = hours - 9;

  if (ot >= 4.5) {
    ot -= 0.5;
  }

  return Math.max(0, ot);
}

export function calculateDayEquiv(hours){
  let dayEquiv = 0;
  if(hours > 6) dayEquiv = 1;
  else if(hours >= 4) dayEquiv = 0.5;
  else dayEquiv = 0;

  return dayEquiv;
}



export function parseTime(timeStr){

  const [time, period] = timeStr.trim().toLowerCase().split(/\s*(am|pm)\s*/).filter(Boolean);


  const [hourStr, minStr] = time.split(":");
  let hour = parseInt(hourStr);
  let min = parseInt(minStr);

  if(period === "pm" && hour !== 12) hour+=12;
  if(period === "am" && hour === 12) hour=0;

  return hour * 60 + min;
}



//this function returns the date december 12, 2025 to 12/12/2025
function parseDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;

  return `${String(d.getMonth() + 1).padStart(2, "0")}/` +
         `${String(d.getDate()).padStart(2, "0")}/` +
         `${String(d.getFullYear()).slice(-2)}`;
}


function extractTime(prefix, lines) {
  const line = lines.find(l =>
    l.trim().toLowerCase().startsWith(prefix)
  );
  return line?.split(":").slice(1).join(":").trim() ?? null;
}

export function parseWorkerRecords(textRequest){

  const lines = textRequest
    .split(/\r?\n/)
    .map( l => l.trim())
    .filter(Boolean);


  const dateLine = lines.find( l => 
    /^[A-Za-z]+\s+\d{1,2},?\s+\d{4}$/.test(l)
  );
  
  const date = parseDate(dateLine);
  const timein = extractTime("timein", lines);
  const timeout = extractTime("timeout", lines);

  if (!date || !timein || !timeout) {
    return { workers: [], error: "Input could not be parsed" };
  }

  const timeoutIndex = lines.findIndex(l =>
    l.toLowerCase().startsWith("timeout")
  );

  const workers = lines
    .slice(timeoutIndex + 1)
    .filter(l => /^[a-zA-Z]+$/.test(l))
    .map(name => ({
      name,
      date,
      timein,
      timeout
    }));

   return workers.length
    ? { workers }
    : { workers: [], error: "Input could not be parsed" };  

}



