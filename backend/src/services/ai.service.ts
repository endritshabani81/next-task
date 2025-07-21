interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

export class AiService {
  private readonly ollamaUrl: string;
  private readonly model: string;

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    this.model = process.env.OLLAMA_MODEL || "mistral";
  }

  async suggestTags(name: string, description: string): Promise<string[]> {
    try {
      const prompt = `Based on the product name '${name}' and description '${description}', generate a JSON array of 5 relevant and concise keyword tags. Example format: ["tag1", "tag2", "tag3"]. Output only the JSON array.`;

      const requestBody: OllamaRequest = {
        model: this.model,
        prompt: prompt,
        stream: false,
      };

      console.log("Sending request to Ollama:", {
        url: `${this.ollamaUrl}/api/generate`,
        model: this.model,
        prompt: prompt.substring(0, 100) + "...",
      });

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as OllamaResponse;
      console.log("Ollama response:", data.response.substring(0, 200) + "...");

      const tags = this.parseTagsFromResponse(data.response);
      return tags;
    } catch (error) {
      console.error("Error calling Ollama API:", error);

      return this.generateFallbackTags(name, description);
    }
  }

  private parseTagsFromResponse(response: string): string[] {
    try {
      const jsonMatch = response.match(/\[.*?\]/);
      if (jsonMatch) {
        const tags = JSON.parse(jsonMatch[0]);
        if (
          Array.isArray(tags) &&
          tags.every((tag) => typeof tag === "string")
        ) {
          return tags.slice(0, 5);
        }
      }

      const lines = response.split("\n").filter((line) => line.trim());
      const tags: string[] = [];

      for (const line of lines) {
        const quotedMatches = line.match(/"([^"]+)"/g);
        if (quotedMatches) {
          quotedMatches.forEach((match) => {
            const tag = match.replace(/"/g, "").trim().toLowerCase();
            if (tag && !tags.includes(tag)) {
              tags.push(tag);
            }
          });
        }
      }

      if (tags.length > 0) {
        return tags.slice(0, 5);
      }

      throw new Error("Could not parse tags from response");
    } catch (error) {
      console.error("Error parsing Ollama response:", error);
      throw new Error("Failed to parse tag suggestions from AI response");
    }
  }

  private generateFallbackTags(name: string, description: string): string[] {
    console.log("Generating fallback tags");

    const fallbackTags: string[] = [];
    const text = `${name} ${description}`.toLowerCase();

    const keywords = [
      "electronics",
      "gadget",
      "device",
      "tech",
      "digital",
      "wireless",
      "bluetooth",
      "smart",
      "portable",
      "mobile",
      "home",
      "kitchen",
      "outdoor",
      "sports",
      "fitness",
      "clothing",
      "fashion",
      "accessory",
      "beauty",
      "health",
      "book",
      "education",
      "toy",
      "game",
      "entertainment",
      "tool",
      "automotive",
      "garden",
      "office",
      "computer",
    ];

    keywords.forEach((keyword) => {
      if (text.includes(keyword) && !fallbackTags.includes(keyword)) {
        fallbackTags.push(keyword);
      }
    });

    if (fallbackTags.length === 0) {
      fallbackTags.push("product", "item", "merchandise");
    }

    const nameWords = name
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter(
        (word) =>
          word.length > 2 && !["the", "and", "for", "with"].includes(word)
      );

    nameWords.forEach((word) => {
      if (!fallbackTags.includes(word) && fallbackTags.length < 5) {
        fallbackTags.push(word);
      }
    });

    return fallbackTags.slice(0, 5);
  }
}
