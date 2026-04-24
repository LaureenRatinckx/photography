import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    
    console.log("New Contact Form Submission:", { name, email, message });
    
    // In a real app, you would use a service like Resend or Nodemailer here.
    // Example:
    // await sendEmail({ to: "laureen.ratinckx@gmail.com", subject: `New message from ${name}`, text: message });

    res.json({ success: true, message: "Bericht succesvol verzonden!" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
