import express from "express";
import axios from "axios";

const router = express.Router();

// ================= CONFIG =================
const JUDGE0_ENDPOINT = "https://ce.judge0.com";
const REQUEST_TIMEOUT = 20000;

// ================= HELPERS =================
const decodeBase64 = (data) => {
  if (!data) return "";
  try {
    const decoded = Buffer.from(data, "base64").toString("utf-8");
    return decoded;
  } catch (e) {
    console.error("Base64 decode error:", e);
    return "";
  }
};

// ================= RUN CODE API =================
router.post("/run", async (req, res) => {
  const { code, language_id, input } = req.body;

  // Validation
  if (typeof code !== "string" || !language_id) {
    return res.status(400).json({
      success: false,
      error: "Code and language_id are required"
    });
  }

  try {
    // Encode inputs to base64
    const encodedCode = Buffer.from(code).toString("base64");
    const encodedInput = input ? Buffer.from(input).toString("base64") : "";

    console.log("=== SENDING TO JUDGE0 ===");
    console.log("Language ID:", language_id);
    console.log("Original code:", code);
    console.log("Encoded code:", encodedCode);

    // Submit to Judge0 with base64 encoding
    const submissionData = {
      source_code: encodedCode,
      language_id: Number(language_id),
      stdin: encodedInput,
      base64_encoded: true,  // Tell Judge0 we're sending base64
    };

    const response = await axios.post(
      `${JUDGE0_ENDPOINT}/submissions?base64_encoded=true&wait=true`,
      submissionData,
      { 
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("=== JUDGE0 RAW RESPONSE ===");
    console.log("Full response:", JSON.stringify(response.data, null, 2));

    // Decode outputs
    const stdout = decodeBase64(response.data.stdout);
    const stderr = decodeBase64(response.data.stderr);
    const compileOutput = decodeBase64(response.data.compile_output);
    const message = decodeBase64(response.data.message);

    console.log("=== DECODED OUTPUTS ===");
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
    console.log("compile_output:", compileOutput);
    console.log("message:", message);

    const status = response.data.status;
    let output = "";

    // Determine output based on status
    if (status?.id === 3) {
      // Accepted
      output = stdout || "Execution successful (no output)";
    } else if (status?.id === 6) {
      // Compilation Error
      output = `Compilation Error:\n${compileOutput || stderr || "Unknown compilation error"}`;
    } else if (status?.id === 5) {
      // Time Limit Exceeded
      output = "Time Limit Exceeded";
    } else if (status?.id === 4) {
      // Wrong Answer (shouldn't happen for code execution)
      output = stdout || stderr || "Execution failed";
    } else if (status?.id === 11) {
      // Runtime Error
      output = `Runtime Error:\n${stderr || message || "Unknown runtime error"}`;
    } else if (status?.id === 12) {
      // Runtime Error (NZEC)
      output = `Runtime Error (Non-zero Exit Code):\n${stderr || message || "Unknown error"}`;
    } else if (status?.id === 13) {
      // Internal Error
      output = "Judge0 Internal Error";
    } else if (stderr) {
      output = `Error:\n${stderr}`;
    } else {
      output = stdout || message || "No output";
    }

    // Clean output
    output = output.trim();

    console.log("=== FINAL OUTPUT ===");
    console.log(output);

    res.json({
      success: status?.id === 3,
      output: output,
      status: status?.description || "Unknown",
      statusId: status?.id,
      time: response.data.time,
      memory: response.data.memory
    });

  } catch (error) {
    console.error("=== ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);

    if (error.code === 'ECONNABORTED' || error.message.includes("timeout")) {
      return res.status(504).json({
        success: false,
        error: "Request timeout - Judge0 server is busy"
      });
    }

    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message || "Execution failed"
    });
  }
});

export default router;