"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Upload,
  Star,
  Check,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  title: string;
  description: string;
  features: string[];
  estimated_price: number;
}

interface ApiResponse {
  status: string;
  message: string;
  detected_objects: string[];
  transcription: string;
  products: Product[];
}

type UploadMode = "media" | "text";

const Navbar: React.FC = () => (
  <nav className="w-full bg-white dark:bg-gray-900 shadow-lg fixed top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-primary">listit</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  </nav>
);

const MediaUploadCard: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<UploadMode>("media");
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = (uploadedFiles: File[]): void => {
    const file = uploadedFiles[0];
    if (file && file.type.startsWith("video/")) {
      setFiles(uploadedFiles);
      setVideoPreview(URL.createObjectURL(file));
      setError("");
      setApiResponse(null);
    } else {
      setError("Please upload a valid video file");
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (files.length === 0) {
      setError("Please select a video file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const base64String = await convertFileToBase64(files[0]);

      const response = await fetch(
        "http://120.0.0.1:8000/api/v1/generate/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_base64: base64String,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process video");
      }

      const data: ApiResponse = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    setFiles([]);
    setApiResponse(null);
    setError("");
    setDescription("");
    setVideoPreview("");
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col gap-6 items-center min-h-screen bg-background p-4 pt-24">
        <Card className="w-full max-w-3xl border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-accent/10 pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span>Video Product Generator</span>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="mode-toggle">
                  {selectedMode === "media" ? "Text" : "Media"}
                </Label>
                <Switch
                  id="mode-toggle"
                  checked={selectedMode === "text"}
                  onCheckedChange={() =>
                    setSelectedMode((prev) =>
                      prev === "media" ? "text" : "media"
                    )
                  }
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            {selectedMode === "media" ? (
              <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                {videoPreview ? (
                  <div className="w-full h-96 flex items-center justify-center">
                    <video
                      src={videoPreview}
                      controls
                      className="max-w-full max-h-full"
                    />
                  </div>
                ) : (
                  <FileUpload onChange={handleFileUpload} />
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="description" className="sr-only">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Enter your description..."
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  className="min-h-[120px] resize-y w-full p-2 border rounded-md"
                />
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={handleReset} type="button">
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="min-w-[100px]"
                type="button"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Analyze Video
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {apiResponse && (
          <div className="w-full max-w-3xl space-y-6">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Video Analysis Results
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-primary">
                      Detected Objects:
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {apiResponse.detected_objects.map((object, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-accent/20 rounded-full text-sm"
                        >
                          {object}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">Transcription:</h3>
                    <p className="mt-2 text-muted-foreground">
                      {apiResponse.transcription}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {apiResponse.products.map((product, index) => (
              <Card
                key={index}
                className="border-2 border-primary/20 shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {index === 0 && files[0] && (
                      <div className="aspect-square bg-accent/10 rounded-lg flex items-center justify-center">
                        <video
                          src={URL.createObjectURL(files[0])}
                          controls
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div
                      className={`flex flex-col gap-4 ${
                        index !== 0 && "md:col-span-2"
                      }`}
                    >
                      <h2 className="text-2xl font-semibold text-primary">
                        {product.title}
                      </h2>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          (128 reviews)
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        ${product.estimated_price.toFixed(2)}
                      </div>
                      <p className="text-muted-foreground">
                        {product.description}
                      </p>
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Key Features:</h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button className="flex-1" type="button">
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          type="button"
                        >
                          Save for Later
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MediaUploadCard;
