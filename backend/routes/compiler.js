import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { code, language_id, input } = req.body;

  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"
,
      {
        source_code: code,
        language_id,
        stdin: input || ""
      },
      {
        headers: {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
}

      }
    );

    res.json({
      output:
        response.data.stdout ||
        response.data.stderr ||
        response.data.compile_output ||
        "No output"
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Code execution failed" });
  }
});

export default router;
