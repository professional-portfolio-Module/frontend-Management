import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: React.ReactNode;
  allowZoom?: boolean;
}

export const SecureImage: React.FC<SecureImageProps> = ({
  src,
  fallback,
  allowZoom = true,
  className = "",
  alt = "Secure Asset Image",
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setImageSrc("");
      return;
    }

    let isMounted = true;
    let objectUrl = "";

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await apiClient.get(src, {
          responseType: "blob",
        });

        if (isMounted) {
          objectUrl = URL.createObjectURL(response.data);
          setImageSrc(objectUrl);
        }
      } catch (err) {
        console.error("Failed to load secure image via BFF proxy:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-100 border border-slate-200 animate-pulse rounded-md min-h-[160px] w-full p-4">
        <svg
          className="animate-spin h-5 w-5 text-slate-400 mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-xs font-medium text-slate-400">Loading evidence...</span>
      </div>
    );
  }

  if (error || !src) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-md min-h-[160px] w-full p-4">
          <svg
            className="h-8 w-8 text-slate-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs text-slate-400 font-medium">No photo evidence available</span>
        </div>
      )
    );
  }

  return (
    <>
      <div className="relative group cursor-pointer overflow-hidden rounded-md border border-slate-200">
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} transition-transform duration-300 group-hover:scale-[1.02]`}
          onClick={() => {
            if (allowZoom) setIsZoomed(true);
          }}
          {...props}
        />
        {allowZoom && (
          <div
            onClick={() => setIsZoomed(true)}
            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
          >
            <span className="text-white text-xs font-semibold bg-slate-900/80 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
              Click to view larger
            </span>
          </div>
        )}
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <div className="absolute top-4 right-4 z-55">
            <button
              onClick={() => setIsZoomed(false)}
              className="rounded-full bg-slate-900/60 p-2 text-slate-200 hover:bg-slate-900/80 hover:text-white transition-colors border border-slate-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            className="relative max-w-5xl max-h-[85vh] overflow-hidden rounded-lg bg-slate-900 shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageSrc}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">{alt}</span>
              <a
                href={imageSrc}
                download={alt || "evidence.jpg"}
                className="text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors shadow-sm"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
