import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Link2, 
  Image as ImageIcon,
  Quote, 
  Code, 
  List, 
  ListOrdered, 
  Indent, 
  Outdent, 
  Undo2, 
  Redo2,
  Upload,
  Globe,
  X,
  Check,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { uploadApi } from '../../api/upload';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something inspiring...',
  minHeight = '180px',
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    strikeThrough: false,
    heading: false,
    quote: false,
    code: false,
    ul: false,
    ol: false,
  });

  // Image Upload Modal States
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imageAltInput, setImageAltInput] = useState<string>('');
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Sync external value when needed without disrupting active typing
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedRangeRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        heading: document.queryCommandValue('formatBlock') === 'h3' || document.queryCommandValue('formatBlock') === 'heading',
        quote: document.queryCommandValue('formatBlock') === 'blockquote',
        code: document.queryCommandValue('formatBlock') === 'pre',
        ul: document.queryCommandState('insertUnorderedList'),
        ol: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Ignore if document selection query fails
    }
  }, []);

  const executeCommand = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'createLink') {
      const url = window.prompt('Enter link URL (e.g. https://example.com):', 'https://');
      if (url && url.trim()) {
        document.execCommand('createLink', false, url.trim());
      }
    } else if (command === 'heading') {
      const isH3 = activeFormats.heading;
      document.execCommand('formatBlock', false, isH3 ? '<p>' : '<h3>');
    } else if (command === 'blockquote') {
      const isQuote = activeFormats.quote;
      document.execCommand('formatBlock', false, isQuote ? '<p>' : '<blockquote>');
    } else if (command === 'code') {
      const isCode = activeFormats.code;
      document.execCommand('formatBlock', false, isCode ? '<p>' : '<pre>');
    } else {
      document.execCommand(command, false, arg);
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Handle empty content normalization
      if (html === '<br>' || html === '<p><br></p>' || html.trim() === '') {
        onChange('');
      } else {
        onChange(html);
      }
      updateActiveFormats();
    }
  };

  // Open modal and preserve selection
  const handleOpenImageModal = () => {
    saveSelection();
    setImageError(null);
    setUploadedDataUrl('');
    setUploadedFileName('');
    setImageUrlInput('');
    setImageAltInput('');
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setImageError(null);
  };

  // Process selected file via backend upload API
  const processImageFile = async (file: File) => {
    setImageError(null);
    setIsProcessingFile(true);
    try {
      const res = await uploadApi.uploadImage(file, 'general');
      setUploadedDataUrl(res.url);
      setUploadedFileName(file.name);
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload image.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Insert image HTML into editor
  const insertImageIntoEditor = (src: string, altText: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    const sanitizedAlt = altText.replace(/"/g, '&quot;');
    const imageHtml = `<figure class="my-4 text-center inline-block w-full"><img src="${src}" alt="${sanitizedAlt || 'Event media'}" class="rounded-2xl max-w-full mx-auto border border-zinc-200/80 shadow-xs object-cover max-h-[480px]" />${
      sanitizedAlt ? `<figcaption class="text-xs text-zinc-500 mt-1.5 italic font-medium">${sanitizedAlt}</figcaption>` : ''
    }</figure><p><br></p>`;

    // Insert HTML
    let inserted = false;
    try {
      inserted = document.execCommand('insertHTML', false, imageHtml);
    } catch {
      inserted = false;
    }

    if (!inserted) {
      if (savedRangeRef.current) {
        const fragment = savedRangeRef.current.createContextualFragment(imageHtml);
        savedRangeRef.current.insertNode(fragment);
        savedRangeRef.current.collapse(false);
      } else {
        editorRef.current.innerHTML += imageHtml;
      }
    }

    onChange(editorRef.current.innerHTML);
    updateActiveFormats();
    setIsImageModalOpen(false);
  };

  // Direct paste support on editor (e.g. screenshot or copied image)
  const handleEditorPaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          try {
            const res = await uploadApi.uploadImage(file, 'general');
            insertImageIntoEditor(res.url, file.name.replace(/\.[^/.]+$/, ''));
          } catch {
            // Silently ignore or user can use dialog
          }
        }
        return;
      }
    }
  };

  // Direct drag and drop image file onto editor
  const handleEditorDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        try {
          const res = await uploadApi.uploadImage(file, 'general');
          insertImageIntoEditor(res.url, file.name.replace(/\.[^/.]+$/, ''));
        } catch {
          // Silently ignore or user can use dialog
        }
      }
    }
  };

  return (
    <div 
      className={`rounded-2xl border transition-all overflow-hidden bg-white ${
        isFocused 
          ? 'border-[#E31B23] ring-2 ring-red-100 shadow-xs' 
          : 'border-zinc-200 hover:border-zinc-300'
      } ${className}`}
    >
      {/* ================= TOP TOOLBAR (Matches screenshot + Image Upload) ================= */}
      <div className="bg-zinc-50 border-b border-zinc-200/80 px-2 py-1.5 flex items-center justify-between gap-1 select-none flex-wrap">
        
        {/* Left Formats */}
        <div className="flex items-center flex-wrap gap-0.5 sm:gap-1">
          {/* Bold */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
              activeFormats.bold 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs font-extrabold' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <span className="font-extrabold text-sm px-0.5">B</span>
          </button>

          {/* Italic */}
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              activeFormats.italic 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <span className="italic font-serif font-bold text-sm px-0.5">I</span>
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            title="Strikethrough"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('strikeThrough'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.strikeThrough 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Link */}
          <button
            type="button"
            title="Insert Link"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('createLink'); }}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>

          {/* Image Upload / Insert Button */}
          <button
            type="button"
            title="Upload or Insert Image"
            onMouseDown={(e) => { e.preventDefault(); handleOpenImageModal(); }}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer relative group"
          >
            <ImageIcon className="w-4 h-4 text-zinc-700 group-hover:text-[#E31B23] transition-colors" />
          </button>

          {/* Typography / Heading */}
          <button
            type="button"
            title="Heading style"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('heading'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              activeFormats.heading 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs font-black' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-baseline font-black leading-none text-xs">
              <span className="text-sm">T</span>
              <span className="text-[10px] font-bold ml-0.5">T</span>
            </div>
          </button>

          {/* Blockquote */}
          <button
            type="button"
            title="Blockquote"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('blockquote'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.quote 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Code */}
          <button
            type="button"
            title="Code Block"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('code'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.code 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Bullet List */}
          <button
            type="button"
            title="Bulleted List"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.ul 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            title="Numbered List"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('insertOrderedList'); }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.ol 
                ? 'bg-zinc-200 text-zinc-950 shadow-2xs' 
                : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Outdent (Decrease Indent) */}
          <button
            type="button"
            title="Decrease Indent"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('outdent'); }}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <Outdent className="w-4 h-4" />
          </button>

          {/* Indent (Increase Indent) */}
          <button
            type="button"
            title="Increase Indent"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('indent'); }}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <Indent className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: Undo & Redo */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('undo'); }}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Redo (Ctrl+Y)"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('redo'); }}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= EDITING CANVAS ================= */}
      <div className="relative p-4 sm:p-5">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => { setIsFocused(true); updateActiveFormats(); }}
          onBlur={() => { setIsFocused(false); }}
          onKeyUp={() => { saveSelection(); updateActiveFormats(); }}
          onMouseUp={() => { saveSelection(); updateActiveFormats(); }}
          onPaste={handleEditorPaste}
          onDrop={handleEditorDrop}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className="outline-none text-zinc-900 text-sm font-normal leading-relaxed overflow-y-auto max-h-[420px] focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400 empty:before:pointer-events-none [&_h3]:text-base [&_h3]:font-black [&_h3]:text-zinc-950 [&_h3]:my-2 [&_p]:my-1.5 [&_blockquote]:border-l-3 [&_blockquote]:border-[#E31B23] [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:text-zinc-600 [&_blockquote]:my-2 [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_a]:text-[#E31B23] [&_a]:underline [&_a]:font-bold [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-3 [&_img]:border [&_img]:border-zinc-200/80 [&_img]:shadow-xs"
        />
      </div>

      {/* ================= IMAGE UPLOAD MODAL ================= */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseImageModal();
          }}
        >
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E31B23] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-950 tracking-tight">Insert Story Image</h4>
                  <p className="text-[11px] text-zinc-400">Upload from your device or link web image</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseImageModal}
                className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-zinc-100 bg-zinc-50/70 p-1 gap-1 m-4 mb-2 rounded-xl">
              <button
                type="button"
                onClick={() => { setImageTab('upload'); setImageError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  imageTab === 'upload' 
                    ? 'bg-white text-zinc-950 shadow-2xs' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => { setImageTab('url'); setImageError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  imageTab === 'url' 
                    ? 'bg-white text-zinc-950 shadow-2xs' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Image Link URL</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 pt-2 space-y-4">
              {/* TAB 1: UPLOAD FROM DEVICE */}
              {imageTab === 'upload' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {uploadedDataUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 p-2 group">
                      <img 
                        src={uploadedDataUrl} 
                        alt="Upload Preview" 
                        className="w-full h-44 object-cover rounded-xl"
                      />
                      <div className="mt-2 flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-zinc-700 truncate max-w-[200px]">
                          {uploadedFileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedDataUrl('');
                            setUploadedFileName('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingModal(true); }}
                      onDragLeave={() => setIsDraggingModal(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingModal(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processImageFile(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                        isDraggingModal 
                          ? 'border-[#E31B23] bg-red-50/30 ring-2 ring-red-100' 
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {isProcessingFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-7 h-7 text-[#E31B23] animate-spin" />
                          <span className="text-xs font-bold text-zinc-600">Processing image...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mb-2 shadow-2xs">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-zinc-900">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-[11px] text-zinc-400 mt-1">
                            PNG, JPG, WebP or GIF up to 8MB
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: IMAGE URL */}
              {imageTab === 'url' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800">Web Image URL</label>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#E31B23] focus:bg-white transition-all"
                    />
                  </div>

                  {imageUrlInput && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 p-2">
                      <img 
                        src={imageUrlInput} 
                        alt="Preview" 
                        onError={() => setImageError('Could not load image from this URL. Please verify the link.')}
                        className="w-full h-36 object-cover rounded-xl" 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Optional Caption / Alt text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">Caption / Alt text <span className="text-zinc-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={imageAltInput}
                  onChange={(e) => setImageAltInput(e.target.value)}
                  placeholder="e.g. VIP Lounge stage setup preview"
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#E31B23] focus:bg-white transition-all"
                />
              </div>

              {/* Error notification */}
              {imageError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleCloseImageModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={imageTab === 'upload' ? !uploadedDataUrl : !imageUrlInput}
                  onClick={() => {
                    const finalSrc = imageTab === 'upload' ? uploadedDataUrl : imageUrlInput;
                    if (finalSrc) {
                      insertImageIntoEditor(finalSrc, imageAltInput);
                    }
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E31B23] hover:bg-[#c9171e] disabled:opacity-50 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert into Story</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;

