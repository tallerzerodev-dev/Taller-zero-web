'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Save, Eye, LayoutTemplate, AlertTriangle, PlayCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { PreviewHome, PreviewAbout, PreviewSession, PreviewVip } from './components/PreviewMockups'


// Usar 'sessions' como clave y valor de page para backend
const defaultEditorData: Record<string, any> = {
  home: { heroTitle: '', heroSubtitle: '', heroBackground: '', featuredSessionId: '', featuredSessionTitle: '', featuredSessionGif: '', featuredItemImage: '', featuredItemTitle: '', featuredItemSubtitle: '', tickerText: '' },
  about: { title: '', content: '', showMarquee: true, marqueeText: '• RAW AUDIO • INDUSTRIAL VISUALS • HEAVYWEIGHT MERCH • NO COMPROMISE • BODEGA SESSIONS', coverImage: '', infoSquares: [
        { title: "SESSIONS", desc: "Sets exclusivos grabados en formato video/audio desde locaciones industriales secretas. Solo techno, industrial y variantes contundentes del sonido underground.", bgColor: "bg-gray-950" },
        { title: "MERCH", desc: "Diseño utilitario. Prendas fabricadas con algoritmos de alta resistencia y gramaje pesado. Creado por y para quienes habitan el ecosistema nocturno y diurno.", bgColor: "bg-gray-950" },
        { title: "COMMUNITY", desc: "Fomentamos una red de creativos, djs, productores y artesanos. La intersección final donde el esfuerzo artesanal se cruza con las visuales digitales.", bgColor: "bg-gray-950" },
        { title: "NEW SQUARE", desc: "Espacio disponible para más manifiestos.", bgColor: "bg-gray-950" }
    ] },
  sessions: { title: '', sessionNumber: '', dateText: '', gifUrl: '', trailerUrl: '', spinup: '', showLeftColInfo: true, leftColLine1: '', leftColLine2: '', leftColLine3: '', artists: [] },
  vip: { title: '', dateText: '', location: '', rules: '', lineup: '', welcomeImage: '', welcomeText: '', infoImage: '', farewellText: '' },
  winner: { title: '', dateText: '', location: '', rules: '', lineup: '', welcomeImage: '', welcomeText: '', infoImage: '', farewellText: '' },
  email: { subjectGuest: '', titleGuest: '', messageGuest: '', subjectWinner: '', titleWinner: '', messageWinner: '', footer: '' }
};

function EditorContent() {
  const searchParams = useSearchParams()
  const rawPage = searchParams.get('page') || 'home';
  // Si el parámetro es alguna variante de sesiones, usar 'sessions' para el backend
  const page = ['sesiones', 'sesiónes', 'sesiónes', 'Sesiónes', 'sessions'].includes(rawPage.toLowerCase()) ? 'sessions' : rawPage;

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [content, setContent] = useState(defaultEditorData[page] || defaultEditorData.home)
  const [storeEnabled, setStoreEnabled] = useState(content?.storeEnabled || false)
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

      if (page === 'sessions') {
        try {
          // 1. Obtener la lista de Sesiónes
          const res = await fetch('/api/admin/content?type=sessions');
          if (res.ok) {
            let list = await res.json();
            // Ordenar por sessionNumber numérico descendente (más reciente primero)
            list = list.sort((a: { sessionNumber: string }, b: { sessionNumber: string }) => {
              const numA = parseInt((a.sessionNumber || '').replace(/\D/g, ''), 10) || 0;
              const numB = parseInt((b.sessionNumber || '').replace(/\D/g, ''), 10) || 0;
              return numB - numA;
            });
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
              const detailRes = await fetch(`/api/admin/content?type=sessions&id=${targetId}`);
              if (detailRes.ok) {
                const sessionData = await detailRes.json();
                if (sessionData) {
                  setContent({ ...sessionData });
                  setCurrentSessionId(targetId);
                }
              }
            } else {
              // No hay sesiones
              setContent(defaultEditorData.sessions);
            }
          }
        } catch (e) {
          console.error("Error trayendo Sesiónes", e);
        }
      } else {
        // Fetch home or about
        try {
          if (page === 'home') {
            // También traemos la lista de sesiones para el dropdown en "Home"
            const rawList = await fetch('/api/admin/content?type=sessions');
            if (rawList.ok) setSessionsList(await rawList.json());
          }

          const res = await fetch(`/api/admin/content?type=${page}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Object.keys(data).length > 0 && data.id) {
              if (page === 'about' && typeof data.infoSquares === 'string') {
                try {
                    data.infoSquares = JSON.parse(data.infoSquares)
                } catch(e) {}
              }
              if (page === 'about' && !data.infoSquares) {
                  data.infoSquares = defaultEditorData.about.infoSquares
              }
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

    // Solo restringir tamaño para imágenes, no para videos
    if (file.type.startsWith('image/')) {
      if (processedFile.size > 10485760) {
        alert(`❌ EL ARCHIVO "${processedFile.name}" ES DEMASIADO GRANDE INCLUSO TRAS INTENTAR COMPRIMIR. Pesa ${(processedFile.size / 1048576).toFixed(2)} MB, y el límite del servidor es 10 MB. ¡Por favor comprímelo manualmente!`);
        if (eventTarget) eventTarget.value = '';
        return;
      }
    }

    callback(URL.createObjectURL(processedFile));
  }

  const handleArtistChange = (index: number, field: string, value: string) => {
    const newArtists = [...content.artists];
    newArtists[index] = { ...newArtists[index], [field]: value };
    handleChange('artists', newArtists);
  }

  const handleInfoSquareChange = (index: number, field: string, value: string) => {
    const newSquares = [...(content.infoSquares || defaultEditorData.about.infoSquares)];
    newSquares[index] = { ...newSquares[index], [field]: value };
    handleChange('infoSquares', newSquares);
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
        if (finalContent.infoSquares) finalContent.infoSquares = JSON.stringify(finalContent.infoSquares);
      } else if (page === 'sessions') {
        if (finalContent.gifUrl) finalContent.gifUrl = await uploadIfBlob(finalContent.gifUrl);
        if (finalContent.trailerUrl) finalContent.trailerUrl = await uploadIfBlob(finalContent.trailerUrl);
        if (finalContent.artists) {
          for (let i = 0; i < finalContent.artists.length; i++) {
            if (finalContent.artists[i].photo) {
              finalContent.artists[i].photo = await uploadIfBlob(finalContent.artists[i].photo);
            }
            if (finalContent.artists[i].profilePhoto) {
              finalContent.artists[i].profilePhoto = await uploadIfBlob(finalContent.artists[i].profilePhoto);
            }
          }
        }
      } else if (page === 'vip' || page === 'winner') {
        if (finalContent.welcomeImage) finalContent.welcomeImage = await uploadIfBlob(finalContent.welcomeImage);
        if (finalContent.infoImage) finalContent.infoImage = await uploadIfBlob(finalContent.infoImage);
      }
      setSaveStatus("GUARDANDO EN POSTGRESQL...");
      const action = searchParams.get('action') || 'edit';

      const response = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page, action, content: finalContent })
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

          {page === 'sessions' && searchParams.get('action') !== 'new' && (
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

          {page === 'sessions' && searchParams.get('action') === 'new' && (
            <div className="bg-white text-black font-bold uppercase tracking-widest text-[10px] p-2 inline-block">
              Modo: Creando Nueva Sesión
            </div>
          )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-10 font-mono text-sm uppercase tracking-widest text-[#888]">

          {page === 'sessions' && (
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
                        artists: [...content.artists, { name: '', photo: '', profilePhoto: '', bio: '', youtube: '' }]
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
                      <label className="text-[10px] text-white uppercase tracking-widest flex justify-between mb-1"><span>Foto Lineup (Tarjeta)</span> {artist.photo && <span className="text-[#4ade80]">✓ CARGADA</span>}</label>
                      <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-1 text-white text-[10px] mb-1 file:mr-2 file:bg-white file:text-black file:border-0 file:px-2 file:py-1 file:text-[10px] file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleArtistChange(index, 'photo', url), e.target)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-white uppercase tracking-widest flex justify-between mb-1"><span>Foto Perfil Interna</span> {artist.profilePhoto && <span className="text-[#4ade80]">✓ CARGADA</span>}</label>
                      <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-1 text-white text-[10px] mb-1 file:mr-2 file:bg-white file:text-black file:border-0 file:px-2 file:py-1 file:text-[10px] file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleArtistChange(index, 'profilePhoto', url), e.target)} />
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
                <input type="text" value={content.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Título" />
                <textarea rows={10} value={content.content || ''} onChange={(e) => handleChange('content', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Contenido del Manifiesto" />
              </div>
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">2. MEDIA</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Subir Imagen de Portada Info</label>
                  <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('coverImage', url), e.target)} />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">3. MARQUEE</h3>
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={content.showMarquee} onChange={(e) => handleChange('showMarquee', e.target.checked)} id="showMarquee" />
                  <label htmlFor="showMarquee" className="text-[10px] text-white uppercase tracking-widest">Mostrar Marquee (Cinta desplazable)</label>
                </div>
                {content.showMarquee && (
                  <textarea rows={2} value={content.marqueeText || ''} onChange={(e) => handleChange('marqueeText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] mb-2" placeholder="Texto Marquésina" />
                )}
              </div>
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">4. INFO SQUARES (4 MÁX)</h3>
                {(content.infoSquares || defaultEditorData.about.infoSquares).map((square: any, idx: number) => (
                  <div key={idx} className="bg-[#050505] border border-[#222] p-4 space-y-2 relative">
                    <span className="text-white font-bold text-xs mb-2 block">Cuadro {idx + 1}</span>
                    <input type="text" placeholder="Título" value={square.title} onChange={(e) => handleInfoSquareChange(idx, 'title', e.target.value)} className="w-full bg-black border border-[#333] p-2 text-white text-xs" />
                    <textarea rows={2} placeholder="Descripción" value={square.desc} onChange={(e) => handleInfoSquareChange(idx, 'desc', e.target.value)} className="w-full bg-black border border-[#333] p-2 text-white text-[10px]" />
                    <select value={square.bgColor || 'bg-gray-950'} onChange={(e) => handleInfoSquareChange(idx, 'bgColor', e.target.value)} className="w-full bg-black border border-[#333] p-2 text-white text-xs">
                        <option value="bg-gray-950">Gris Muy Oscuro (bg-gray-950)</option>
                        <option value="bg-black">Negro (bg-black)</option>
                        <option value="bg-gray-900">Gris Oscuro (bg-gray-900)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'vip' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">PÁGINA VIP SECRETA</h3>
                <p className="text-[10px] text-[#888] mb-4">Esta información solo será visible para quienes escaneen el QR de su invitación o entren con su enlace único.</p>
                
                <input type="text" value={content.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Título del Evento (Ej: CÁPSULA 002 EXCLUSIVO)" />
                <input type="text" value={content.dateText || ''} onChange={(e) => handleChange('dateText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Fecha y Hora (Ej: JUEVES 23 - 22:00 HRS)" />
                
                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">SECCIÓN 1: BIENVENIDA (IZQ FOTO, DER TEXTO)</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Imagen de Bienvenida (Cuadrada ideal)</label>
                  <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('welcomeImage', url), e.target)} />
                </div>
                <textarea rows={4} value={content.welcomeText || ''} onChange={(e) => handleChange('welcomeText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Texto de Bienvenida / Valores..." />

                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">SECCIÓN 2: INFORMACIÓN (IZQ TEXTOS, DER FOTO)</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Imagen de Información (Cuadrada ideal)</label>
                  <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('infoImage', url), e.target)} />
                </div>
                <input type="text" value={content.location || ''} onChange={(e) => handleChange('location', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Locación (Ej: SECRET LOCATION - PROVIDENCIA)" />
                <textarea rows={4} value={content.lineup || ''} onChange={(e) => handleChange('lineup', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed mb-2" placeholder="Lineup del evento..." />
                <textarea rows={4} value={content.rules || ''} onChange={(e) => handleChange('rules', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Ej: No fotos, código de vestimenta industrial dark..." />

                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">SECCIÓN 3: DESPEDIDA (ANCHO COMPLETO)</h3>
                <textarea rows={4} value={content.farewellText || ''} onChange={(e) => handleChange('farewellText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Mensaje de despedida..." />
              </div>
            </div>
          )}

          {page === 'winner' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">PÁGINA GANADORES SECRETA</h3>
                <p className="text-[10px] text-[#888] mb-4">Esta información solo será visible para quienes escaneen el QR de su invitación de concurso o entren con su enlace único.</p>
                
                <input type="text" value={content.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Título del Evento (Ej: GANADOR CÁPSULA 002)" />
                <input type="text" value={content.dateText || ''} onChange={(e) => handleChange('dateText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Fecha y Hora (Ej: JUEVES 23 - 22:00 HRS)" />
                
                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">SECCIÓN 1: BIENVENIDA (IZQ FOTO, DER TEXTO)</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Imagen de Bienvenida (Cuadrada ideal)</label>
                  <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('welcomeImage', url), e.target)} />
                </div>
                <textarea rows={4} value={content.welcomeText || ''} onChange={(e) => handleChange('welcomeText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Texto de Bienvenida / Felicitaciones..." />

                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">SECCIÓN 2: INFORMACIÓN (IZQ TEXTOS, DER FOTO)</h3>
                <div className="mb-4">
                  <label className="text-[10px] text-white uppercase tracking-widest block mb-1">Imagen de Información (Cuadrada ideal)</label>
                  <input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleFileWithLimit(e.target.files?.[0], url => handleChange('infoImage', url), e.target)} />
                </div>
                <input type="text" value={content.location || ''} onChange={(e) => handleChange('location', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Locación (Ej: SECRET LOCATION - PROVIDENCIA)" />
                <textarea rows={4} value={content.lineup || ''} onChange={(e) => handleChange('lineup', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed mb-2" placeholder="Lineup del evento..." />
                <textarea rows={4} value={content.rules || ''} onChange={(e) => handleChange('rules', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Ej: Instrucciones de acceso para ganadores..." />

                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">SECCIÓN 3: DESPEDIDA (ANCHO COMPLETO)</h3>
                <textarea rows={4} value={content.farewellText || ''} onChange={(e) => handleChange('farewellText', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Mensaje de despedida..." />
              </div>
            </div>
          )}

          {page === 'email' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-white border-b border-[#333] pb-2 text-xs">CORREO PARA INVITADOS VIP</h3>
                <input type="text" value={content.subjectGuest || ''} onChange={(e) => handleChange('subjectGuest', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Asunto del Correo (Ej: TALLER ZERO - TU ACCESO EXCLUSIVO)" />
                <input type="text" value={content.titleGuest || ''} onChange={(e) => handleChange('titleGuest', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Título Interno (Ej: COMUNICADO DE ACCESO)" />
                <textarea rows={3} value={content.messageGuest || ''} onChange={(e) => handleChange('messageGuest', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Mensaje antes del nombre (Ej: IDENTIDAD CONFIRMADA)" />

                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">CORREO PARA GANADORES DE CONCURSO</h3>
                <input type="text" value={content.subjectWinner || ''} onChange={(e) => handleChange('subjectWinner', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Asunto del Correo (Ej: TALLER ZERO - GANADOR DEL CONCURSO)" />
                <input type="text" value={content.titleWinner || ''} onChange={(e) => handleChange('titleWinner', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-xs mb-2" placeholder="Título Interno (Ej: ACCESO OTORGADO)" />
                <textarea rows={3} value={content.messageWinner || ''} onChange={(e) => handleChange('messageWinner', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Mensaje antes del nombre (Ej: FELICITACIONES)" />

                <h3 className="text-white border-b border-[#333] pb-2 text-xs mt-6">PIE DE PÁGINA COMÚN</h3>
                <textarea rows={4} value={content.footer || ''} onChange={(e) => handleChange('footer', e.target.value)} className="w-full bg-black border border-[#333] p-3 text-white text-[10px] leading-relaxed" placeholder="Texto final en todos los correos (Ej: DRESSCODE: BLACK...)" />
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

          {page === 'home' && <PreviewHome content={content} />}
          {page === 'about' && <PreviewAbout content={content} />}
          {page === 'sessions' && <PreviewSession content={content} />}
          {page === 'vip' && <PreviewVip content={content} />}
          {page === 'winner' && <PreviewVip content={content} />}
          {page === 'email' && (
            <div className="flex items-center justify-center h-full text-[#888] font-mono text-xs uppercase tracking-widest border-2 border-dashed border-[#222] p-8 text-center">
              <div>
                <p className="mb-2">La previsualización de correo no está disponible aquí.</p>
                <p>Genera una invitación desde el panel para probarlo en tu bandeja de entrada.</p>
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

