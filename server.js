const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const usbDetect = require("usb-detection");
const { exec } = require("child_process");
const app = express();
const PORT = 3000;
const LOG_PATH = path.join(__dirname, "logs/usb_log.csv");
// onemogucavanje
///najnovije

function disableDrive(driveLetter) {
  // Putanja do skripte
  const scriptPath = path.join(__dirname, "disable_drive.txt");
  const command = `powershell -Command "Start-Process cmd -ArgumentList '/c diskpart /s \\"${scriptPath}\\"' -Verb RunAs"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Greška pri onemogućavanju diska: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Disk ${driveLetter} je onemogućen.`);
  });
}
///najnovije
function enableDrive(driveLetter) {
  // Putanja do skripte
  const scriptPath = path.join(__dirname, "enable_drive.txt");
  const command = `powershell -Command "Start-Process cmd -ArgumentList '/c diskpart /s \\"${scriptPath}\\"' -Verb RunAs"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Greška pri omogućavanju diska: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Disk ${driveLetter} je ponovo omogućen.`);
  });
}

// Pozovite funkciju za ponovno omogućavanje D diska
app.use(bodyParser.json()); // Pravilno parsiranje JSON podataka
app.use(express.static(path.join(__dirname, "public")));
// Proveri da li fajl postoji, ako ne, kreiraj ga
if (!fs.existsSync(LOG_PATH)) {
  fs.writeFileSync(LOG_PATH, "Timestamp,Name,Phone\n");
}
// POST endpoint za unos podataka
app.post("/submit", (req, res) => {
  enableDrive('D');
  const { name, phone } = req.body;
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_PATH, `"${timestamp}","${name}","${phone}"\n`);
  // Odgovori sa JSON porukom o uspehu
  res.json({ success: true });
});
// GET endpoint za vraćanje logova
app.get("/log", (req, res) => {
  const csv = fs.readFileSync(LOG_PATH, "utf-8");
  const lines = csv.trim().split("\n").slice(1); // Skip header
  const rows = lines.map((line) =>
    line.split(",").map((cell) => cell.replace(/\"/g, ""))
  );
  res.json(rows);
});
// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// USB monitor
usbDetect.startMonitoring();
usbDetect.on("add", (device) => {
  console.log("USB inserted:", device);
  //--------------
  disableDrive('D')
  exec(`start chrome http://localhost:${PORT}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
});