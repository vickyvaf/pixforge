import { useState } from "react";
import { useSelector } from "@xstate/react";
import { ImageUpload } from "../components/ImageUpload";
import { Upload, Wand2, Sparkles } from "lucide-react";
import { Button } from "../uikit/Button";
import { CreditDisplay } from "../features/credits/CreditDisplay";
import { creditActor } from "../features/credits/creditMachine";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResultDisplay } from "../components/ResultDisplay";

const PROMPTS = [
  "A romantic dinner under the Eiffel Tower at sunset",
  "Hiking together in the Swiss Alps on a sunny day",
  "Sharing a milkshake at a 1950s retro diner",
  "Dancing in the rain on a cobblestone street in Paris",
  "A cozy campfire night under the starry sky",
  "Walking hand in hand on a tropical beach in Bali",
  "A futuristic cyberpunk city adventure at night",
  "Picnic in a field of sunflowers in Tuscany",
  "Exploring an ancient temple in the jungle together",
  "A snowy Christmas morning opening gifts by the fireplace",
  "Riding a hot air balloon over Cappadocia",
  "Snorkeling in the Great Barrier Reef",
  "Cooking a messy vibrant pasta dinner together in a rustic kitchen",
  "Dressed as royalty at a masquerade ball in Venice",
  "A road trip in a vintage convertible along Route 66",
  "Watching the Northern Lights in Iceland",
  "A candid laugh together in a busy Tokyo street market",
  "Sipping coffee in a cozy bookshop café on a rainy day",
  "Portrait as astronauts on the surface of Mars",
  "A magical forest walk surrounded by glowing fireflies",
];

export default function Home() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const credits = useSelector(creditActor, (s) => s.context.credits);
  const canGenerate = !!(fileA && fileB) && credits > 0;

  const handleInspireMe = () => {
    if (isGenerating) return;
    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  const handleGenerate = async () => {
    if (credits <= 0) return;
    if (!fileA || !fileB) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setGeneratedImage(null);

    try {
      // Deduct credit
      creditActor.send({ type: "USE_CREDIT" });

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      // Use the standard free tier model
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });
        return {
          inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
          },
        };
      };

      const imagePartA = await fileToGenerativePart(fileA);
      const imagePartB = await fileToGenerativePart(fileB);

      const result = await model.generateContent([
        prompt +
          " Generate a realistic image of these two people in this scenario.",
        imagePartA,
        imagePartB,
      ]);
      const response = await result.response;

      console.log("Full Response:", response);

      let foundImage = false;
      // Check for image content
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (
            part.inlineData &&
            part.inlineData.mimeType.startsWith("image/")
          ) {
            setGeneratedImage(
              `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            );
            foundImage = true;
          }
          if (part.text) {
            setResult(part.text);
          }
        }
      }

      if (!foundImage && !result) {
        // Fallback for legacy text
        setResult(response.text());
      }
    } catch (err: any) {
      console.error("Error generating content:", err);
      if (err.message?.includes("429") || err.message?.includes("Quota")) {
        setError("Rate limit exceeded. Please try again later.");
      } else {
        setError(err.message || "Failed to generate content.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Hero / Intro */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Create the Perfect Moment Together
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Combine photos of two different people into a single, realistic
              moment using AI. No photoshoot required.
            </p>
          </div>

          {/* Upload Section */}
          <div className="grid gap-8 md:grid-cols-2">
            <ImageUpload
              label="Person A"
              color="blue"
              onFileSelect={setFileA}
              disabled={isGenerating}
            />
            <ImageUpload
              label="Person B"
              color="purple"
              onFileSelect={setFileB}
              disabled={isGenerating}
            />
          </div>

          {/* Action Area */}
          <div className="w-full space-y-4">
            <div
              className={`relative bg-white p-2 rounded-3xl shadow-sm border focus-within:ring-2 focus-within:ring-blue-100 transition-all ${
                isGenerating
                  ? "border-gray-100 opacity-70 pointer-events-none"
                  : "border-gray-200 focus-within:border-blue-500"
              }`}
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the moment you want to create (e.g., 'A romantic dinner in Paris')..."
                disabled={isGenerating}
                className="w-full h-32 p-4 rounded-2xl resize-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-lg disabled:cursor-not-allowed"
              />

              <div className="flex justify-between items-center px-2 pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isGenerating}
                  className="rounded-full hover:bg-yellow-50 hover:text-yellow-600 gap-2 text-gray-500"
                  onClick={handleInspireMe}
                >
                  <Sparkles className="h-4 w-4" />
                  Inspire Me
                </Button>

                <div className="flex items-center gap-3">
                  <CreditDisplay />
                  <Button
                    disabled={!canGenerate || !prompt.trim() || isGenerating}
                    onClick={handleGenerate}
                    className="rounded-full"
                  >
                    <Wand2 className="h-5 w-5 mr-2 " />
                    {isGenerating ? <>Generating...</> : <>Generate</>}
                  </Button>
                </div>
              </div>
            </div>
            {error && (
              <p className="text-center text-sm text-red-600 bg-red-50 py-2 px-4 rounded-full mx-auto w-fit">
                {error}
              </p>
            )}
            <p className="text-center text-sm text-gray-500">
              Requires 1 Credit per generation
            </p>

            {generatedImage && (
              <div className="pt-8">
                <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">
                    Generated Image
                  </h3>
                  <img
                    src={generatedImage}
                    alt="Generated result"
                    className="w-full rounded-2xl shadow-md"
                  />
                </div>
              </div>
            )}

            {result && !generatedImage && (
              <div className="pt-8">
                <ResultDisplay content={result} />
              </div>
            )}
          </div>

          {/* Features / Steps */}
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-xs border border-gray-100">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                1. Upload Photos
              </h3>
              <p className="mt-2 text-gray-500">
                Choose clear photos of two people you want to combine.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-xs border border-gray-100">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
                <Wand2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                2. AI Processing
              </h3>
              <p className="mt-2 text-gray-500">
                Our AI analyzes lighting and pose to merge them perfectly.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-xs border border-gray-100">
              <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                3. Magic Result
              </h3>
              <p className="mt-2 text-gray-500">
                Download your new realistic shared moment.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
