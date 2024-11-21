"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const MediaUploadCard = () => {
  const [selectedMode, setSelectedMode] = useState("media");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget;
  }

  const handleFileChange = (event: FileChangeEvent) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileType(file.type.startsWith("image/") ? "image" : "video");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-accent/10 pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Content Upload</span>
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
            <div>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 hover:border-primary",
                  filePreview ? "border-primary" : "border-muted-foreground"
                )}
              >
                {!filePreview ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    {fileType === "image" ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-md object-contain"
                      />
                    ) : (
                      <video
                        src={filePreview}
                        controls
                        className="max-h-64 mx-auto rounded-md"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex space-x-2">
                      {fileType === "image" && (
                        <Image className="text-primary" />
                      )}
                      {fileType === "video" && (
                        <Video className="text-primary" />
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-y w-full p-2 border rounded-md"
              />
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button>{selectedMode === "media" ? "Upload" : "Submit"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaUploadCard;
