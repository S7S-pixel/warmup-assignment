const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
  // TODO: Implement this function
  let p1 = startTime.split(" ");
  let t1 = p1[0].split(":");

  let hr1 = parseInt(t1[0]);
  let min1 = parseInt(t1[1]);
  let sec1 = parseInt(t1[2]);

  if (p1[1] === "pm" && hr1 !== 12) hr1 += 12;
  if (p1[1] === "am" && hr1 === 12) hr1 = 0;

  let startSeconds = hr1 * 3600 + min1 * 60 + sec1;

  let p2 = endTime.split(" ");
  let t2 = p2[0].split(":");

  let hr2 = parseInt(t2[0]);
  let min2 = parseInt(t2[1]);
  let sec2 = parseInt(t2[2]);

  if (p2[1] === "pm" && hr2 !== 12) hr2 += 12;
  if (p2[1] === "am" && hr2 === 12) hr2 = 0;

  let endSeconds = hr2 * 3600 + min2 * 60 + sec2;

  let diff = endSeconds - startSeconds;

  // Fix for shifts that pass midnight
  if (diff < 0) {
    diff += 24 * 3600;
  }

  let hours = Math.floor(diff / 3600);
  let minutes = Math.floor((diff % 3600) / 60);
  let seconds = diff % 60;

  return (
    hours +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
  // TODO: Implement this function
  let startParts = startTime.split(" ");
  let endParts = endTime.split(" ");

  let startTimeParts = startParts[0].split(":");
  let endTimeParts = endParts[0].split(":");

  let startHour = parseInt(startTimeParts[0]);
  let startMin = parseInt(startTimeParts[1]);
  let startSec = parseInt(startTimeParts[2]);

  let endHour = parseInt(endTimeParts[0]);
  let endMin = parseInt(endTimeParts[1]);
  let endSec = parseInt(endTimeParts[2]);

  if (startParts[1] === "pm" && startHour !== 12) startHour += 12;
  if (startParts[1] === "am" && startHour === 12) startHour = 0;

  if (endParts[1] === "pm" && endHour !== 12) endHour += 12;
  if (endParts[1] === "am" && endHour === 12) endHour = 0;

  let startSeconds = startHour * 3600 + startMin * 60 + startSec;
  let endSeconds = endHour * 3600 + endMin * 60 + endSec;

  let idleSeconds = 0;

  let eightAM = 8 * 3600;
  let tenPM = 22 * 3600;

  if (startSeconds < eightAM) {
    idleSeconds += Math.min(endSeconds, eightAM) - startSeconds;
  }

  if (endSeconds > tenPM) {
    idleSeconds += endSeconds - Math.max(startSeconds, tenPM);
  }

  let h = Math.floor(idleSeconds / 3600);
  let m = Math.floor((idleSeconds % 3600) / 60);
  let s = idleSeconds % 60;

  m = m.toString().padStart(2, "0");
  s = s.toString().padStart(2, "0");

  return h + ":" + m + ":" + s;
}
// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
  // TODO: Implement this function
  let s1 = shiftDuration.split(":");
  let s2 = idleTime.split(":");

  let shiftSeconds =
    parseInt(s1[0]) * 3600 + parseInt(s1[1]) * 60 + parseInt(s1[2]);
  let idleSeconds =
    parseInt(s2[0]) * 3600 + parseInt(s2[1]) * 60 + parseInt(s2[2]);

  let diff = shiftSeconds - idleSeconds;

  let h = Math.floor(diff / 3600);
  let m = Math.floor((diff % 3600) / 60);
  let s = diff % 60;

  m = m.toString().padStart(2, "0");
  s = s.toString().padStart(2, "0");

  return h + ":" + m + ":" + s;
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
  let parts = date.split("-");
  let year = Number(parts[0]);
  let month = Number(parts[1]);
  let day = Number(parts[2]);

  let timeParts = activeTime.split(":");
  let hours = Number(timeParts[0]);
  let minutes = Number(timeParts[1]);
  let seconds = Number(timeParts[2]);

  let activeSeconds = hours * 3600;
  activeSeconds = activeSeconds + minutes * 60;
  activeSeconds = activeSeconds + seconds;

  let quotaSeconds = 8 * 3600 + 24 * 60;

  if (year === 2025 && month === 4 && day >= 10 && day <= 30) {
    quotaSeconds = 6 * 3600;
  }

  if (activeSeconds >= quotaSeconds) {
    return true;
  } else {
    return false;
  }
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
  let data = fs.readFileSync(textFile, "utf8");
  let lines = data.trim().split("\n");

  // check duplicate (skip header)
  for (let i = 1; i < lines.length; i++) {
    let parts = lines[i].split(",");

    let driverID = parts[0];
    let date = parts[2];

    if (driverID === shiftObj.driverID && date === shiftObj.date) {
      return {};
    }
  }

  // calculate values (assuming you already wrote these functions)
  let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
  let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
  let activeTime = getActiveTime(shiftDuration, idleTime);
  let metQuotaResult = metQuota(shiftObj.date, activeTime);

  let hasBonus = false;

  // create CSV line
  let newLine =
    shiftObj.driverID +
    "," +
    shiftObj.driverName +
    "," +
    shiftObj.date +
    "," +
    shiftObj.startTime +
    "," +
    shiftObj.endTime +
    "," +
    shiftDuration +
    "," +
    idleTime +
    "," +
    activeTime +
    "," +
    metQuotaResult +
    "," +
    hasBonus;

  // add to file
  fs.appendFileSync(textFile, "\n" + newLine);

  // return object with 10 properties
  return {
    driverID: shiftObj.driverID,
    driverName: shiftObj.driverName,
    date: shiftObj.date,
    startTime: shiftObj.startTime,
    endTime: shiftObj.endTime,
    shiftDuration: shiftDuration,
    idleTime: idleTime,
    activeTime: activeTime,
    metQuota: metQuotaResult,
    hasBonus: hasBonus,
  };
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================

function setBonus(textFile, driverID, date, newValue) {
  let lines = fs.readFileSync(textFile, "utf8").split("\n");

  for (let i = 0; i < lines.length; i++) {
    let parts = lines[i].split(",");

    if (parts[0] === driverID && parts[1] === date) {
      parts[5] = newValue.toString(); // update hasBonus
      lines[i] = parts.join(",");
    }
  }

  fs.writeFileSync(textFile, lines.join("\n"));
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
  let lines = fs.readFileSync(textFile, "utf8").split("\n");

  let count = 0;
  let driverFound = false;

  month = parseInt(month);

  for (let line of lines) {
    if (line.trim() === "" || line.startsWith("DriverID")) continue;

    let parts = line.split(",");

    let id = parts[0].trim();
    let date = parts[2].trim();
    let bonus = parts[9].trim().toLowerCase();

    let recordMonth = parseInt(date.split("-")[1]);

    if (id === driverID) {
      driverFound = true;

      if (recordMonth === month && bonus === "true") {
        count++;
      }
    }
  }

  if (!driverFound) return -1;

  return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
  let data = fs.readFileSync(textFile, "utf8").split("\n");

  let totalSeconds = 0;

  for (let i = 1; i < data.length; i++) {
    // skip header

    let line = data[i].trim();
    if (line === "") continue;

    let parts = line.split(",");

    let id = parts[0].trim();
    let date = parts[2].trim();
    let activeTime = parts[7].trim();

    let lineMonth = parseInt(date.split("-")[1]);

    if (id === driverID && lineMonth === month) {
      let timeParts = activeTime.split(":");
      let h = parseInt(timeParts[0]);
      let m = parseInt(timeParts[1]);
      let s = parseInt(timeParts[2]);

      totalSeconds += h * 3600 + m * 60 + s;
    }
  }

  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  let hhh = String(hours).padStart(3, "0");
  let mm = String(minutes).padStart(2, "0");
  let ss = String(seconds).padStart(2, "0");

  return `${hhh}:${mm}:${ss}`;
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================

function getRequiredHoursPerMonth(
  textFile,
  rateFile,
  bonusCount,
  staffID,
  month,
) {
  let shifts = fs.readFileSync(textFile, "utf8").split("\n");
  let rates = fs.readFileSync(rateFile, "utf8").split("\n");

  let dayOff = "";
  let normalQuota = 0;

  for (let line of rates) {
    line = line.trim();
    if (line === "") continue;

    let parts = line.split(",");

    if (parts[0].trim() === staffID) {
      dayOff = parts[1].trim();
      normalQuota = parseInt(parts[3]);
    }
  }

  let totalHours = 0;

  for (let i = 1; i < shifts.length; i++) {
    let line = shifts[i].trim();
    if (line === "") continue;

    let parts = line.split(",");

    let id = parts[0].trim();
    let date = parts[2].trim();

    let d = new Date(date);
    let m = d.getMonth() + 1;
    let dayName = d.toLocaleDateString("en-US", { weekday: "long" });

    if (id === staffID && m === month) {
      if (dayName === dayOff) continue;

      let day = d.getDate();

      if (month === 4 && day >= 10 && day <= 30) totalHours += 6;
      else totalHours += normalQuota;
    }
  }

  totalHours -= bonusCount * 2;

  return String(totalHours).padStart(3, "0") + ":00:00";
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================

function timeToSeconds(t) {
  let [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function getNetPay(driverID, actualHours, requiredHours, rateFile) {
  let lines = fs.readFileSync(rateFile, "utf8").trim().split("\n");

  let basePay = 0;
  let tier = 0;

  for (let line of lines) {
    let parts = line.split(",");
    if (parts[0].trim() === driverID) {
      basePay = parseInt(parts[2]);
      tier = parseInt(parts[3]);
    }
  }

  let actual = timeToSeconds(actualHours);
  let required = timeToSeconds(requiredHours);

  if (actual >= required) return basePay;

  let missingSeconds = required - actual;
  let missingHours = Math.floor(missingSeconds / 3600);

  let allowance = [0, 50, 20, 10, 3][tier];

  let billableMissing = Math.max(0, missingHours - allowance);

  let deductionRatePerHour = Math.floor(basePay / 185);

  let salaryDeduction = billableMissing * deductionRatePerHour;

  return basePay - salaryDeduction;
}

module.exports = getNetPay;

module.exports = {
  getShiftDuration,
  getIdleTime,
  getActiveTime,
  metQuota,
  addShiftRecord,
  setBonus,
  countBonusPerMonth,
  getTotalActiveHoursPerMonth,
  getRequiredHoursPerMonth,
  getNetPay,
};
