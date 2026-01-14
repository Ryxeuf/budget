"use client";

import { Modal } from "./ui";

export function FilePreviewModal({ 
  file, 
  onClose 
}: { 
  file: { name: string, path: string, type: string } | null; 
  onClose: () => void;
}) {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <Modal 
      isOpen={!!file} 
      onClose={onClose} 
      title={file.name}
      className="max-w-6xl h-[90vh]"
    >
      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden">
        {isImage ? (
          <img 
            src={`/api/files/${file.path}`} 
            alt={file.name} 
            className="max-w-full max-h-full object-contain"
          />
        ) : isPdf ? (
          <iframe 
            src={`/api/files/${file.path}`} 
            className="w-full h-full border-none"
            title={file.name}
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-slate-500 mb-4">Ce type de fichier ne peut pas être prévisualisé directement.</p>
            <a 
              href={`/api/files/${file.path}?download=1`}
              className="text-blue-600 font-bold hover:underline"
            >
              Télécharger le fichier
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}
