
/**
 * Analyze sentiment using a Hugging Face model.
 * Model: distilbert-base-uncased-finetuned-sst-2-english
 */
export const analyzeSentimentHF = async (text: string): Promise<{ label: string; score: number } | null> => {
  const hfToken = process.env.HF_API_TOKEN; // Ensure this is set in your environment
  if (!hfToken) {
    console.warn("Hugging Face Token is missing, skipping HF analysis");
    return null;
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        headers: { Authorization: `Bearer ${hfToken}` },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );
    const result = await response.json();
    // HF returns an array of arrays for this model: [[{label: 'POSITIVE', score: 0.99}]]
    return result[0]?.[0] || null;
  } catch (error) {
    console.error("Hugging Face analysis failed:", error);
    return null;
  }
};
