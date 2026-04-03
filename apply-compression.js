const fs = require('fs');
const path = require('path');

const fileE = path.join(__dirname, 'src/app/admin/dashboard/editor/page.tsx');
let contentE = fs.readFileSync(fileE, 'utf8');

if (!contentE.includes('import imageCompression')) {
    contentE = contentE.replace(
        `import { Save, Eye, LayoutTemplate, AlertTriangle, PlayCircle } from 'lucide-react'`,
        `import { Save, Eye, LayoutTemplate, AlertTriangle, PlayCircle } from 'lucide-react'\nimport imageCompression from 'browser-image-compression'`
    );
}

// Update the handleFileWithLimit function
const newHandleFileWithLimit = `const handleFileWithLimit = async (file: File | undefined, callback: (url: string) => void, eventTarget?: HTMLInputElement) => {
    if (!file) return callback('');

    let processedFile = file;

    // Si pesa más de ~8MB y es imagen, intenta comprimir
    if (file.type.startsWith('image/') && file.size > 8 * 1024 * 1024) {
      try {
        console.log(\`Comprimiendo \${file.name}...\`);
        const options = {
          maxSizeMB: 8,
          maxWidthOrHeight: 3000,
          useWebWorker: true
        };
        processedFile = await imageCompression(file, options);
        console.log(\`Comprimida de \${(file.size / 1024 / 1024).toFixed(2)}MB a \${(processedFile.size / 1024 / 1024).toFixed(2)}MB\`);
      } catch (error) {
        console.error('Error al comprimir:', error);
      }
    }

    // Cloudinary free tier limit: 10MB (10485760 bytes)
    if (processedFile.size > 10485760) {
      alert(\`❌ EL ARCHIVO "\${processedFile.name}" ES DEMASIADO GRANDE INCLUSO TRAS INTENTAR COMPRIMIR. Pesa \${(processedFile.size / 1048576).toFixed(2)} MB, y el límite del servidor es 10 MB. ¡Por favor comprímelo manualmente!\`);
      if (eventTarget) eventTarget.value = '';
      return;
    }

    callback(URL.createObjectURL(processedFile));
  }`;

// Use regex to replace the old handleFileWithLimit
contentE = contentE.replace(/const handleFileWithLimit = \([^)]+\) => \{[\s\S]*?callback\(URL\.createObjectURL\(file\)\);\s*\}/, newHandleFileWithLimit);

fs.writeFileSync(fileE, contentE);

const fileG = path.join(__dirname, 'src/app/admin/dashboard/galeria/page.tsx');
let contentG = fs.readFileSync(fileG, 'utf8');

if (!contentG.includes('import imageCompression')) {
    contentG = contentG.replace(
        `import { FadeIn } from '@/components/ui/Animations'`,
        `import { FadeIn } from '@/components/ui/Animations'\nimport imageCompression from 'browser-image-compression'`
    );
}

const oldOnChange = `onChange={e => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const fileArray = Array.from(e.target.files);
                                            const oversized = fileArray.filter(f => f.size > 10485760);
                                            if (oversized.length > 0) {
                                                alert(\`⚠️ \${oversized.length} archivo(s) superan el límite de 10 MB gratuito y serán ignorados. (Ej: \${oversized[0].name})\`);
                                            }
                                            const validFiles = fileArray.filter(f => f.size <= 10485760);
                                            setFiles(validFiles);
                                            if (validFiles.length === 0) e.target.value = '';
                                        }
                                    }}`;

// Because encoding issues might break exact replace, we can replace everything between `onChange={e => {` and `className="w-full bg-black border`
const regexG = /onChange=\{e => \{[\s\S]*?className="w-full bg-black border/;

const newOnChange = `onChange={async e => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setUploading(true);
                                            const fileArray = Array.from(e.target.files);
                                            const processedFiles = [];
                                            
                                            for (let i = 0; i < fileArray.length; i++) {
                                                const f = fileArray[i];
                                                setProgress({ current: i + 1, total: fileArray.length, failed: 0 }); // Usamos progress temporalmente para indicar compresión
                                                if (f.type.startsWith('image/') && f.size > 8 * 1024 * 1024) {
                                                    try {
                                                        const options = { maxSizeMB: 8, maxWidthOrHeight: 3000, useWebWorker: true };
                                                        const compressed = await imageCompression(f, options);
                                                        processedFiles.push(compressed);
                                                    } catch (err) {
                                                        console.error('Error comprimiendo:', err);
                                                        processedFiles.push(f);
                                                    }
                                                } else {
                                                    processedFiles.push(f);
                                                }
                                            }

                                            const oversized = processedFiles.filter(f => f.size > 10485760);
                                            if (oversized.length > 0) {
                                                alert(\`❌ \${oversized.length} archivo(s) pesan más de 10 MB incluso después de intentar comprimirlos, por lo que serán ignorados. (Ej: \${oversized[0].name})\`);
                                            }
                                            
                                            const validFiles = processedFiles.filter(f => f.size <= 10485760);
                                            setFiles(prev => [...prev, ...validFiles]);
                                            
                                            setUploading(false);
                                            setProgress({ current: 0, total: 0, failed: 0 });

                                            if (validFiles.length === 0) e.target.value = '';
                                        }
                                    }}
                                    className="w-full bg-black border`;

contentG = contentG.replace(regexG, newOnChange);

// Let's also update the label text temporarily so we don't show "Subiendo fotos al servidor" when compiling. But it's fine.
contentG = contentG.replace(/Subiendo fotos al servidor.../g, 'Procesando/Subiendo fotos...');

fs.writeFileSync(fileG, contentG);
console.log('Arquitectura reescrita!');