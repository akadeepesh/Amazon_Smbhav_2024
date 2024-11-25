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
  LogOut,
  ExternalLink,
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
  products: Product[];
}

type UploadMode = "media" | "text";

const Navbar: React.FC = () => {
  const isLogin = true;
  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-lg fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary font-serif italic">
              listit
            </h1>
          </div>
          <div className="flex gap-4">
            {!isLogin ? (
              <>
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </>
            ) : (
              <Button variant="outline" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const MediaUploadCard: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<UploadMode>("media");
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");

  const dummyApiResponse: ApiResponse = {
    status: "success",
    message: "Product details retrieved successfully",
    products: [
      {
        title: "Acer Iconia Tab 11",
        description:
          "The Acer Iconia Tab 11 is a versatile tablet designed for work and play. It offers a powerful processor, ample storage, and a stunning display, making it ideal for everyday tasks.",
        features: [
          "MediaTek Helio P22T processor",
          "4GB RAM, 64GB storage",
          "8.7-inch WXGA IPS display",
          "5MP front camera, 8MP rear camera",
          "4G LTE, Wi-Fi 5",
          "Android 14",
          "MicroSD card slot",
          "Premium flip cover",
        ],
        estimated_price: 11990,
      },
    ],
  };

  const handleFileUpload = (uploadedFiles: File[]): void => {
    const file = uploadedFiles[0];
    if (
      file &&
      (file.type.startsWith("video/") || file.type.startsWith("image/"))
    ) {
      setFiles(uploadedFiles);
      setVideoPreview(URL.createObjectURL(file));
      setError("");
      setApiResponse(null);
    } else {
      setError("Please upload a valid video or image file");
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (files.length === 0) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate 5 seconds loading
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Use dummy data instead of API call
      setApiResponse(dummyApiResponse);
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
      <div className="flex flex-col gap-6 items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 pt-24">
        <Card className="w-full max-w-4xl border-2 border-primary/20 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/10 pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Product Analyzer</span>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="mode-toggle" className="text-sm">
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
                  className="min-h-[120px] resize-y w-full p-2 border-2 border-primary/20 rounded-md focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleReset}
                type="button"
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="min-w-[120px] bg-primary hover:bg-primary/90 transition-colors"
                type="button"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Analyze
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {apiResponse && (
          <Card className="w-full max-w-4xl border-2 border-primary/20 shadow-2xl rounded-xl overflow-hidden">
            {apiResponse.products.map((product, index) => (
              <CardContent
                key={index}
                className="p-6 bg-white dark:bg-gray-800"
              >
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="bg-accent/10 rounded-lg flex items-center justify-center p-4">
                    <img
                      src="/image.png"
                      alt="Product"
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold text-primary">
                      {product.title}
                    </h2>
                    <div className="flex items-center gap-2">
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
                    <div className="text-4xl font-bold text-green-600">
                      ₹{product.estimated_price.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2 text-primary">
                        Key Features:
                      </h3>
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
                    <Button
                      className="mt-4 w-full flex items-center gap-2"
                      onClick={() =>
                        window.open(
                          "https://www.amazon.in/Acer-iM9-12M-Display-Dual-Camera-Android/dp/B0DGQJ8X7W?th=1",
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Amazon
                    </Button>
                  </div>
                </div>
              </CardContent>
            ))}
          </Card>
        )}
      </div>
    </>
  );
};

export default MediaUploadCard;
