
import React, { useState, useCallback, useRef } from 'react';
import { fileToBase64 } from './utils/imageUtils';
import { editImage } from './services/geminiService';
import { INITIAL_IMAGE_DATA_URL, INITIAL_IMAGE_MIME_TYPE } from './constants';
import ImageCard from './components/ImageCard';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string>(INITIAL_IMAGE_DATA_URL);
  const [originalMimeType, setOriginalMimeType] = useState<string>(INITIAL_IMAGE_MIME_TYPE);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Ajuste essa imagem e coloque um blazer preto para uma foto de perfil profissional');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64String = await fileToBase64(file);
        setOriginalImage(base64String);
        setOriginalMimeType(file.type);
        setEditedImage(null);
        setError(null);
      } catch (err) {
        setError('Failed to load image. Please try another file.');
        console.error(err);
      }
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!prompt || !originalImage) {
      setError('Please provide an image and a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const base64Data = originalImage.split(',')[1];
      const result = await editImage(base64Data, originalMimeType, prompt);
      setEditedImage(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalMimeType, prompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI Profile Picture Enhancer
          </h1>
          <p className="mt-2 text-lg text-gray-400">Transform your photos with a simple text prompt.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Original Image & Controls */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-lg">
            <ImageCard title="Original Image" imageUrl={originalImage} altText="Original user-provided image" />
            
            <div className="flex flex-col gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload New Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />

              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                  Editing Prompt
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Make the background a professional office setting"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {isLoading ? 'Generating...' : 'Enhance Image'}
            </button>
          </div>

          {/* Right Panel: Edited Image */}
          <div className="flex flex-col gap-6 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-lg">
             <div className="flex-grow flex items-center justify-center min-h-[300px] lg:min-h-full">
              {isLoading ? (
                <div className="text-center">
                  <Spinner />
                  <p className="mt-4 text-gray-400">AI is working its magic...</p>
                </div>
              ) : error ? (
                <div className="text-center p-4 border border-red-500/50 bg-red-900/20 rounded-lg">
                  <h3 className="font-bold text-red-400">Error</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              ) : editedImage ? (
                <ImageCard title="Enhanced Image" imageUrl={editedImage} altText="AI-edited image" />
              ) : (
                <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2">Your enhanced image will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
