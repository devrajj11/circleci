const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const STATUSES = ["operational", "degraded", "down"];

let nextId = 4;

let services = [
  { id: 1, name: "API gateway", status: "operational", updatedAt: new Date().toISOString() },
  { id: 2, name: "Payments worker", status: "degraded", updatedAt: new Date().toISOString() },
  { id: 3, name: "Image resizer", status: "down", updatedAt: new Date().toISOString() }
];

// API routes

app.get("/api/services", (req, res) => res.json(services));

app.post("/api/services", (req, res) => {
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }

  if (name.length > 60) {
    return res.status(400).json({
      error: "Name must be 60 characters or fewer."
    });
  }

  const service = {
    id: nextId++,
    name,
    status: "operational",
    updatedAt: new Date().toISOString()
  };

  services.push(service);
  res.status(201).json(service);
});

app.patch("/api/services/:id", (req, res) => {
  const service = services.find(
    (s) => s.id === Number(req.params.id)
  );

  if (!service) {
    return res.status(404).json({ error: "Service not found." });
  }

  const { status } = req.body;

  if (!STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${STATUSES.join(", ")}.`
    });
  }

  service.status = status;
  service.updatedAt = new Date().toISOString();

  res.json(service);
});

app.delete("/api/services/:id", (req, res) => {
  const before = services.length;

  services = services.filter(
    (s) => s.id !== Number(req.params.id)
  );

  if (services.length === before) {
    return res.status(404).json({ error: "Service not found." });
  }

  res.status(204).end();
});

// Serve Vite frontend

const frontendPath = path.join(__dirname, "../client/dist");

app.use(express.static(frontendPath));

// Handle frontend routes

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

// Handle unknown API routes

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// Start server

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Application running on port ${PORT}`);
});