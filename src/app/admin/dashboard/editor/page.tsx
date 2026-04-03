'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Save, Eye, LayoutTemplate, AlertTriangle, PlayCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'

// Diccionario inicial extendido
const defaultEditorData: Record<string, any> = { home: { heroTitle: '', heroSubtitle: '', heroBackground: '', featuredSessionId: '', featuredSessionTitle: '', featuredSessionGif: '', featuredItemImage: '', featuredItemTitle: '', featuredItemSubtitle: '', tickerText: '' }, about: { title: '', content: '', showMarquée: true, coverImage: '' }, Sesiónes: { title: '', sessionNumber: '', dateText: '', gifUrl: '', trailerUrl: '', spinup: '', showLeftColInfo: true, leftColLine1: '', leftColLine2: '', leftColLine3: '', artists: [] } }

function EditorContent() {
  const searchParams = useSearchParams()
  const rawPage = searchParams.get('page') || 'home'
  const page = ['sesiones', 'sesiónes', 'sesiónes', 'Sesiónes'].includes(rawPage.toLowerCase()) ? 'Sesiónes' : rawPage

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [content, setContent] = useState(defaultEditorData[page] || defaultEditorData.home)
  const [storeEnabled, setStoreEnabled] = useState(content.storeEnabled || false)
  const [isDirty, setIsDirty] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const [sessionsList, setSessionsList] = useState<any[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const action = searchParams.get('action');

      if (page === 'Sesiónes') {
        try {
          // 1. Obtener la lista de Sesiónes
          const res = await fetch('/api/admin/content?type=Sesiónes');
          if (res.ok) {
            const list = await res.json();
            setSessionsList(list);

            if (action === 'new') {
              setContent({
                title: '', sessionNumber: '', dateText: '', gifUrl: '', trailerUrl: '',
                spinup: '', showLeftColInfo: true, leftColLine1: '', leftColLine2: '', leftColLine3: '',
                artists: []
              });
            } else if (list.length > 0) {
              // 2. Elegir cul cargar
              const targetId = currentSessionId || list[0].id;
              const detailRes = await fetch(`/api/admin/content?type=Sesiónes&id=${targetId}`);
              if (detailRes.ok) {
                const sessionData = await detailRes.json();
                if (sessionData) {
                  setContent({ ...sessionData });
                  setCurrentSessionId(targetId);
                }
              }
            } else {
              // No hay Sesiónes
              setContent({
                title: '', sessionNumber: '', dateText: '', gifUrl: '', trailerUrl: '',
                spinup: '', showLeftColInfo: true, leftColLine1: '', leftColLine2: '', leftColLine3: '',
                artists: []
              });
            }
          }
        } catch (e) {
          console.error("Error trayendo Sesiónes", e);
        }
      } else {
        // Fetch home or about
        try {
          if (page === 'home') {
            // También traemos la lista de Sesiónes para el dropdown en "Home"
            const rawList = await fetch('/api/admin/content?type=Sesiónes');
            if (rawList.ok) setSessionsList(await rawList.json());
          }

          const res = await fetch(`/api/admin/content?type=${page}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Object.keys(data).length > 0 && data.id) {
              setContent(data);
            } else {
              setContent(defaultEditorData[page]);
            }
          }
        } catch (e) {
          setContent(defaultEditorData[page]);
        }
      }
      setIsDirty(false);
      setIsLoading(false);
    }

    fetchData();
  }, [page, searchParams, currentSessionId])

  const handleChange = (key: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const handleFileWithLimit = async (file: File | undefined, callback: (url: string) => void, eventTarget?: HTMLInputElement) => {
    if (!file) return callback('');

    let processedFile = file;

    // Si pesa más de ~8MB y es imagen, intenta comprimir
    if (file.type.startsWith('image/') && file.size > 8 * 1024 * 1024) {
      try {
        console.log(`Comprimiendo ${file.name}...`);
        const options = {
          maxSizeMB: 8,
          maxWidthOrHeight: 3000,
          useWebWorker: true
        };
        processedFile = await imageCompression(file, options);
        console.log(`Comprimida de ${(file.size / 1024 / 1024).toFixed(2)}MB a ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
      } catch (error) {
        console.error('Error al comprimir:', error);
      }
    }

    // Cloudinary free tier limit: 10MB (10485760 bytes)
    if (processedFile.size > 10485760) {
      alert(`❌ EL ARCHIVO "${processedFile.name}" ES DEMASIADO GRANDE INCLUSO TRAS INTENTAR COMPRIMIR. Pesa ${(processedFile.size / 1048576).toFixed(2)} MB, y el límite del servidor es 10 MB. ¡Por favor comprímelo manualmente!`);
      if (eventTarget) eventTarget.value = '';
      return;
    }

    callback(URL.createObjectURL(processedFile));
  }

  const handleArtistChange = (index: number, field: string, value: string) => {
    const newArtists = [...content.artists];
    newArtists[index] = { ...newArtists[index], [field]: value };
    handleChange('artists', newArtists);
  }

  const uploadIfBlob = async (url: string) => {
    if (!url || !url.startsWith('blob:')) return url;

    let retries = 3;
    while (retries > 0) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const formData = new FormData();
        const ext = blob.type.split('/')[1] || 'bin';
        formData.append('file', blob, `upload.${ext}`);

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await uploadRes.json();

        if (uploadRes.ok && data.url) {
          return data.url;
        } else {
          throw new Error(data.error || 'Cloudinary upload failed');
        }
      } catch (e) {
        console.error(`Error subiendo blob, quedan ${retries - 1} intentos:`, e);
        retries--;
        if (retries === 0) {
          throw new Error("No se pudo subir la imagen al servidor remoto después de varios intentos.");
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return '';
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("SUBIENDO ARCHIVOS AL SERVIDOR...");
    try {
      let finalContent = JSON.parse(JSON.stringify(content));

      if (page === 'home') {
        if (finalContent.heroBackground) finalContent.heroBackground = await uploadIfBlob(finalContent.heroBackground); if (finalContent.featuredSessionGif) finalContent.featuredSessionGif = await uploadIfBlob(finalContent.featuredSessionGif);
        if (finalContent.featuredItemImage) finalContent.featuredItemImage = await uploadIfBlob(finalContent.featuredItemImage);
      } else if (page === 'about') {
        if (finalContent.coverImage) finalContent.coverImage = await uploadIfBlob(finalContent.coverImage);
      } else if (page === 'Sesiónes') {
        if (finalContent.gifUrl) finalContent.gifUrl = await uploadIfBlob(finalContent.gifUrl);
        if (finalContent.trailerUrl) finalContent.trailerUrl = await uploadIfBlob(finalContent.trailerUrl);
        if (finalContent.artists) {
          for (let i = 0; i < finalContent.artists.length; i++) {
            if (finalContent.artists[i].photo) {
              finalContent.artists[i].photo = await uploadIfBlob(finalContent.artists[i].photo);
            }
          }
        }
      }

      setSaveStatus("GUARDANDO EN POSTGRESQL...");
      const action = searchParams.get('action') || 'edit';

      const response = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, action, content: finalContent })
      });

      if (response.ok) {
        setSaveStatus("GUARDADO EXITOSO");
        setIsDirty(false);
      } else {
        setSaveStatus("ERROR AL GUARDAR");
      }
    } catch (e: any) {
      console.error(e);
      setSaveStatus(e.message || "ERROR CRÍTICO AL SUBIR ARCHIVOS");
      alert(e.message || "Ocurrió un error inesperado al subir fotos de los artistas.");
    }

    // Clear status message after 3 seconds
    setTimeout(() => {
      setSaveStatus(null)
      setIsSaving(false)
    }, 4500);
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-black min-h-screen pt-20">

      {/* PANEL LATERAL */}
      <div className={`w-full lg:w-[450px] border-r-2 border-[#222] bg-[#0a0a0a] flex flex-col z-20 ${isPreviewMode ? 'hidden lg:flex lg:w-[150px] opacity-30 grayscale hover:opacity-100 hover:grayscale-0 hover:w-[450px] transition-all overflow-hidden' : 'flex'}`}>

        <div className="p-6 border-b border-[#222] flex-shrink-0 relative">
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="text-[10px] font-mono text-[#888] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mb-6 border border-[#333] hover:border-white px-3 py-1.5 w-fit"
          >
            â† Volver al Panel
          </button>

          <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-4">Edición: {page}</h2>

          {page === 'Sesiónes' && searchParams.get('action') !== 'new' && (
            <select
              className="w-full bg-black border border-[#333] p-3 text-white text-xs font-mono uppercase tracking-widest cursor-pointer outline-none focus:border-white transition-colors"
              value={currentSessionId}
              onChange={(e) => {
                setCurrentSessionId(e.target.value);
                setIsDirty(false);
              }}
            >
              {sessionsList.map((session) => (
                <option key={session.id} value={session.id}>Sesi&oacute;n #{session.sessionNumber} - {session.title}</option>
              ))}
            </select>
          )}

          {page === 'Sesiónes' && searchParams.get('action') === 'new' && (
            <div className="bg-white text-black font-bold uppercase tracking-widest text-[10px] p-2 inline-block">
              Modo: Creando Nueva Sesión
            </div>
          )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-10 font-mono text-sm uppercase tracking-widest text-[#888]">

          {page === 'Sesiónes' && (
            <div className="space-y-12">
              {/* 1. Meta */}
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">1. METADATOS</h3>
                <input type="text" value={content.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Tótulo" />
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <input type="text" value={content.sessionNumber} onChange={(e) => handleChange('sessionNumber', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs" placeholder="# Sesión" />
                  <input type="text" value={content.dateText} onChange={(e) => handleChange('dateText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs" placeholder="Fecha" />
                </div>
                <div className="mb-2">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Subir Portada (GIF/Imagen)</label>
                  <input type="file" accept="image/*,video/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('gifUrl', url), e.target)} />
                  {content.gifUrl && <div className="text-[10px] font-mono text-[#4ade80] mt-1">? GIF Cargado</div>}
                </div>
                <div className="mb-2">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Trailer (Subida o Link Youtube)</label>
                  <input type="file" accept="video/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs mb-1 file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('trailerUrl', url), e.target)} />
                  <input type="text" value={content.trailerUrl} onChange={(e) => handleChange('trailerUrl', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs" placeholder="...o pega URL de YouTube Trailer" />
                </div>
                <textarea rows={4} value={content.spinup} onChange={(e) => handleChange('spinup', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px]" placeholder="SPINUP General" />
              </div>

              {/* 2. Columna Izq */}
              <div className="space-y-4">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs flex justify-between">
                  2. COLUMNA IZQ
                  <div className="cursor-pointer text-[#ffffff]" onClick={() => handleChange('showLeftColInfo', !content.showLeftColInfo)}>
                    {content.showLeftColInfo ? '[OCULTAR]' : '[MOSTRAR]'}
                  </div>
                </h3>
                {content.showLeftColInfo && (
                  <div className="space-y-2 pl-4 border-l border-[#333]">
                    <input type="text" value={content.leftColLine1} onChange={(e) => handleChange('leftColLine1', e.target.value)} className="w-full bg-transparent border-b border-[#333] p-2 text-white text-xs" />
                    <input type="text" value={content.leftColLine2} onChange={(e) => handleChange('leftColLine2', e.target.value)} className="w-full bg-transparent border-b border-[#333] p-2 text-white text-xs" />
                    <input type="text" value={content.leftColLine3} onChange={(e) => handleChange('leftColLine3', e.target.value)} className="w-full bg-transparent border-b border-[#333] p-2 text-white text-xs" />
                  </div>
                )}
              </div>

              {/* 3. Artistas */}
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs flex justify-between items-center">
                  <span>3. ARTISTAS</span>
                  <button
                    onClick={() => {
                      setIsDirty(true);
                      setContent({
                        ...content,
                        artists: [...content.artists, { name: '', photo: '', bio: '', youtube: '' }]
                      });
                    }}
                    className="bg-white text-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-[#ccc]"
                  >
                    + AÃ±adir Artista
                  </button>
                </h3>
                {content.artists.map((artist: any, index: number) => (
                  <div key={index} className="bg-[#050505] border border-[#222] p-4 space-y-2 relative">
                    <button
                      onClick={() => {
                        setIsDirty(true);
                        const newArtists = [...content.artists];
                        newArtists.splice(index, 1);
                        setContent({ ...content, artists: newArtists });
                      }}
                      className="absolute top-4 right-4 text-[#888] hover:text-white text-[10px] uppercase tracking-widest"
                    >
                      Eliminar
                    </button>
                    <span className="text-white font-bold text-xs mb-2 block">{artist.name || `Artista 0${index + 1}`}</span>
                    <input type="text" placeholder="Nombre Artista" value={artist.name} onChange={(e) => handleArtistChange(index, 'name', e.target.value)} className="w-full bg-black border border-[#333] p-2 text-white text-xs" />
                    <div>
                      <label className="text-[10px] text-white uppercase tracking-widest flex justify-between mb-1"><span>Foto Artista</span> {artist.photo && <span className="text-[#4ade80]">✓ CARGADA</span>}</label>
                      <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-1 text-white text-[10px] mb-1 file:mr-2 file:bg-white file:text-black file:border-0 file:px-2 file:py-1 file:text-[10px] file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleArtistChange(index, 'photo', url), e.target)} />
                    </div>
                    <textarea rows={2} placeholder="Mini Bio" value={artist.bio} onChange={(e) => handleArtistChange(index, 'bio', e.target.value)} className="w-full bg-black border border-[#333] p-2 text-white text-[10px]" />
                    <input type="text" placeholder="Link Embebido YouTube" value={artist.youtube} onChange={(e) => handleArtistChange(index, 'youtube', e.target.value)} className="w-full bg-black border border-[#333] p-2 text-white text-[10px]" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'home' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">1. HERO (INICIO)</h3>
                <input type="text" value={content.heroTitle || ''} onChange={(e) => handleChange('heroTitle', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="TÃ­tulo Hero (ej: TALLER ZERO)" />
                <input type="text" value={content.heroSubtitle || ''} onChange={(e) => handleChange('heroSubtitle', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="SubtÃ­tulo Hero" />

                <div className="my-4 p-3 border border-[#333] bg-[#0a0a0a]">
                  <label className="text-[10px] text-[#888] uppercase tracking-widest block mb-2">Fondo del Home (Video MP4 o Imagen)</label>
                  <input type="file" accept="image/*,video/mp4,video/webm" className="w-full bg-black border border-[#333] p-1 text-white text-[10px] mb-1 file:mr-2 file:bg-white file:text-black file:border-0 file:px-2 file:py-1 file:text-[10px] file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('heroBackground', url), e.target)} />
                  {content.heroBackground && <div className="text-[10px] font-mono text-[#4ade80] mt-1">Archivo cargado exitosamente.</div>}
                </div>

                <textarea rows={2} value={content.tickerText || ''} onChange={(e) => handleChange('tickerText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] mb-2" placeholder="Texto Marquésina (Separar con guiones)" />
              </div>
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">2. DESTACADOS</h3>
                <p className="text-[10px] text-[#888] mb-2">Selecciona la sesión a destacar y la imagen para la columna secundaria (ej. Prenda o Modelo).</p>

                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Sesión Destacada</label>
                  <select
                    value={content.featuredSessionId || ''}
                    onChange={(e) => {
                      const selectedSession = sessionsList.find(s => s.id === e.target.value);
                      handleChange('featuredSessionId', e.target.value);
                      if (selectedSession) handleChange('featuredSessionTitle', selectedSession.title);
                    }}
                    className="w-full bg-black border border-[#333] p-2 text-white text-xs cursor-pointer"
                  >
                    <option value="">Selecciona una Sesión...</option>
                    {sessionsList.map(s => (
                      <option key={s.id} value={s.id}>Sesión #{s.sessionNumber} - {s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Subir GIF/Imagen Sesión Destacada</label>
                  <input type="file" accept="image/*,video/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('featuredSessionGif', url), e.target)} />
                </div>

                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Foto Modelo o Prenda</label>
                  <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('featuredItemImage', url), e.target)} />
                </div>

                <input type="text" value={content.featuredItemTitle || ''} onChange={(e) => handleChange('featuredItemTitle', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="TÃ­tulo de Prenda (Ej: POLERA ZERO)" />
                <input type="text" value={content.featuredItemSubtitle || ''} onChange={(e) => handleChange('featuredItemSubtitle', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="SubtÃ­tulo Prenda (Ej: $25.000 CLP)" />
              </div>
            </div>
          )}

          {page === 'about' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">1. MANIFIESTO</h3>
                <input type="text" value={content.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="TÃ­tulo" />
                <textarea rows={10} value={content.content || ''} onChange={(e) => handleChange('content', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Contenido del Manifiesto" />
              </div>
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">2. MEDIA</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Subir Imagen de Portada Info</label>
                  <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('coverImage', url), e.target)} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#222] bg-black">
          <button onClick={handleSave} disabled={!isDirty && !isSaving} className={`w-full font-bold uppercase tracking-widest py-3 border-2 transition-colors flex items-center justify-center gap-2 ${isSaving ? 'bg-white text-black border-white cursor-wait opacity-80' : isDirty ? 'bg-white text-black border-white hover:bg-[#ccc]' : 'bg-[#111] text-[#555] border-[#222] cursor-not-allowed'}`}>
            {isSaving ? <span className="animate-pulse text-[10px]">{saveStatus || 'GUARDANDO...'}</span> : <><Save className="w-4 h-4" /> {saveStatus || 'Guardar'}</>}
          </button>
        </div>
      </div>

      {/* óREA PREVIEW */}
      <div className="flex-1 flex flex-col relative bg-[#111] overflow-hidden">
        <div className="h-14 border-b border-[#222] bg-black flex items-center justify-between px-6 z-10 w-full shrink-0">
          <span className="text-[#888] font-mono text-xs uppercase tracking-widest bg-[#222] px-2 py-0.5">Previsualización: {page}</span>
          <div className="flex items-center gap-4">
            {isDirty && <div className="text-[#ffffff] flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest animate-pulse mr-4"><AlertTriangle className="w-3 h-3" /> Sin guardar</div>}
            <button onClick={() => setIsPreviewMode(!isPreviewMode)} className="text-white flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-[#333] px-3 py-1 hover:border-white">
              <Eye className="w-3 h-3" /> {isPreviewMode ? 'Modo Editor' : 'Ocultar Panel'}
            </button>
          </div>
        </div>

        {/* MOCKUP VISUAL */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#050505]">

          {page === 'home' && (
            <div className="w-full max-w-[1200px] mx-auto bg-black shadow-2xl relative pointer-events-none overflow-hidden">
              {/* Hero Mockup */}
              <div className="w-full h-[60vh] flex flex-col items-center justify-center relative border-b border-[#333]">
                <h1 className="text-[8vw] leading-none font-bold tracking-tighter uppercase mb-4 text-white text-center">
                  {content.heroTitle?.split(' ').map((word: string, i: number) => <span key={i}>{word}<br /></span>) || 'TALLER ZERO'}
                </h1>
                <p className="text-xl text-[#888] font-mono uppercase tracking-widest text-center mt-8">
                  {content.heroSubtitle}
                </p>
              </div>
              {/* Ticker Mockup */}
              <div className="w-full bg-white text-black font-mono text-sm py-3 overflow-hidden whitespace-nowrap font-bold uppercase tracking-widest flex items-center">
                <span className="inline-block animate-pulse">{content.tickerText} {content.tickerText} {content.tickerText}</span>
              </div>

              {/* Split Showcase section */}
              <div className="p-8">
                <div className="flex justify-between items-end border-b-4 border-white pb-6 mb-8 text-white relative z-10">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Ãšltima<br />Sesión</h1>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest mb-2">Destacados</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[400px]">
                  {/* Session Area */}
                  <div className="md:col-span-8 bg-[#111] border-2 border-[#333] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center grayscale opacity-50" style={{ backgroundImage: `url(${content.featuredSessionGif || 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=2076'})` }}></div>
                    <div className="z-10 text-center flex flex-col items-center bg-black/80 px-8 py-6 border border-[#333]">
                      <h3 className="text-2xl font-bold uppercase tracking-widest mb-1 text-white">{content.featuredSessionTitle}</h3>
                      <p className="text-[#888] font-mono uppercase tracking-widest text-xs">SESIÓN #{content.featuredSessionId}</p>
                      <button className="brutalist-button mt-4 !py-2 !px-4 text-xs font-mono">REPRODUCIR</button>
                    </div>
                  </div>

                  {/* Merch/Model Area */}
                  <div className="md:col-span-4 bg-[#111] border-2 border-[#333] relative flex items-end overflow-hidden p-6 group">
                    <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80" style={{ backgroundImage: `url(${content.featuredItemImage || 'https://images.unsplash.com/photo-1550614000-4b95d415dc96?q=80&w=2000'})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="z-10 w-full">
                      <span className="text-[10px] font-mono text-white bg-black border border-white px-2 py-0.5 mb-3 inline-block">NUEVO</span>
                      <h3 className="text-2xl font-bold uppercase tracking-widest text-white mb-1 leading-none">{content.featuredItemTitle}</h3>
                      <p className="text-[#888] font-mono uppercase tracking-widest text-xs border-t border-[#333] pt-2 mt-2">{content.featuredItemSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === 'about' && (
            <div className="w-full max-w-[1200px] mx-auto border border-[#333] bg-black shadow-2xl p-8 relative pointer-events-none">
              <div className="border-b border-[#333] pb-8 mb-8 text-white relative z-10 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">{content.title}</h1>
              </div>
              {content.coverImage && (
                <div className="w-full aspect-[21/9] bg-[#111] border-2 border-[#333] relative flex items-center justify-center overflow-hidden mb-12">
                  <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80" style={{ backgroundImage: `url(${content.coverImage})` }}></div>
                </div>
              )}
              <div className="max-w-2xl mx-auto">
                <p className="font-mono text-sm leading-relaxed text-[#888] whitespace-pre-line text-justify">
                  {content.content}
                </p>
              </div>
            </div>
          )}

          {page === 'Sesiónes' && (
            <div className="w-full max-w-[1200px] mx-auto border border-[#333] bg-black shadow-2xl p-8 relative pointer-events-none">
              <div className="flex justify-between items-end border-b border-[#333] pb-8 mb-8 text-white relative z-10">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter" dangerouslySetInnerHTML={{ __html: content.title.replace(' x ', ' x <br/>') }}></h1>
                  <p className="font-mono mt-4 text-[#ffffff] uppercase tracking-widest text-xs font-bold">Sesión #{content.sessionNumber} ó {content.dateText}</p>
                </div>
                {content.showLeftColInfo && (
                  <div className="text-right font-mono uppercase tracking-widest text-[10px] text-[#888] flex flex-col gap-1">
                    <p className="border-b border-[#333] pb-1 mb-1 inline-block ml-auto">{content.leftColLine1}</p>
                    <p className="text-white">{content.leftColLine2}</p>
                    <p>{content.leftColLine3}</p>
                  </div>
                )}
              </div>

              <div className="w-full aspect-video bg-[#0a0a0a] border border-[#333] relative flex items-center justify-center overflow-hidden mb-16 z-10">
                {(() => {
                  const bgUrl2 = content.gifUrl || '';
                  const isVideo2 = bgUrl2.toLowerCase().endsWith('.mp4') || bgUrl2.toLowerCase().endsWith('.webm') || bgUrl2.toLowerCase().endsWith('.mov');
                  return isVideo2 ? (
                    <video src={bgUrl2} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-40" />
                  ) : (
                    <div className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity opacity-40" style={{ backgroundImage: `url(${bgUrl2})` }}></div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 z-10 relative">
                {content.artists.map((a: any, i: number) => (
                  <div key={i} className="aspect-[4/5] relative border border-[#333] bg-[#111] overflow-hidden grayscale">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${a.photo})` }}></div>
                    <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                      <h3 className="font-mono text-sm font-bold text-white m-0 uppercase">{a.name}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-12 gap-8 border-t border-[#333] pt-8 z-10 relative">
                <div className="col-span-4"><p className="font-mono text-[10px] tracking-widest text-[#ffffff]">ó SPIN UP</p></div>
                <div className="col-span-8"><p className="font-mono text-xs leading-relaxed text-[#888] whitespace-pre-line">{content.spinup}</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ContentEditorPage() {
  return (
    <Suspense fallback={<div className="font-mono text-xs text-white">Cargando...</div>}>
      <EditorContent />
    </Suspense>
  )
}

