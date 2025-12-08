export function roundTime(timeStr) {
  let [hourMin, ampm] = timeStr.toLowerCase().split(/(am|pm)/).filter(Boolean);
  let [hour, min] = hourMin.split(":").map(Number);

  if (min <= 10) min = 0;
  else if (min <= 40) min = 30;
  else {
    min = 0;
    hour += 1;
    if (hour > 12) hour -= 12;
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



