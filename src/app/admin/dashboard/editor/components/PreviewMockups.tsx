import React from 'react'

export function PreviewHome({ content }: { content: any }) {
  return (
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

      {/* FEATURED / LATEST SESSION MOCKUP */}
      <div className="px-8 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-[#333]">
          <div className="flex flex-col h-full justify-center text-left">
              <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] font-bold border border-[#333] px-2 py-1 mb-6 self-start">
                  TRANSMISIÓN DESTACADA
              </span>
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white mb-6 leading-none">
                  {content.featuredSessionTitle || 'ÚLTIMO REGISTRO EN VIVO'}
              </h2>
              <p className="text-[#888] font-mono text-xs uppercase tracking-widest leading-relaxed mb-10 max-w-sm">
                  REVIVE EL ÚLTIMO SET DIRECTO DESDE NUESTRAS INSTALACIONES. AUDIO RAW, CÁMARAS ESTÁTICAS, SIN CENSURA.
              </p>
              <button className="text-xs px-4 py-2 border border-white text-white font-mono uppercase">VER SESIÓN AHORA</button>
          </div>
          <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#0a0a0a] border border-[#333] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity" style={{ backgroundImage: `url(${content.featuredSessionGif || '/placeholder.jpg'})` }}></div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10 mix-blend-difference">
                  <span className="font-mono text-xs bg-white text-black px-3 py-1 uppercase tracking-widest font-bold">REC //</span>
              </div>
          </div>
      </div>
    </div>
  )
}

export function PreviewAbout({ content }: { content: any }) {
  const defaultInfoSquares = [
      { title: "SESSIONS", desc: "Sets exclusivos grabados en formato video/audio desde locaciones industriales secretas. Solo techno, industrial y variantes contundentes del sonido underground.", bgColor: "bg-gray-950" },
      { title: "MERCH", desc: "Diseño utilitario. Prendas fabricadas con algoritmos de alta resistencia y gramaje pesado. Creado por y para quienes habitan el ecosistema nocturno y diurno.", bgColor: "bg-gray-950" },
      { title: "COMMUNITY", desc: "Fomentamos una red de creativos, djs, productores y artesanos. La intersección final donde el esfuerzo artesanal se cruza con las visuales digitales.", bgColor: "bg-gray-950" },
      { title: "NEW SQUARE", desc: "Espacio disponible para más manifiestos.", bgColor: "bg-gray-950" }
  ]
  const squares = content.infoSquares || defaultInfoSquares;

  return (
    <div className="w-full max-w-[1200px] mx-auto border border-[#333] bg-black shadow-2xl p-8 relative pointer-events-none">
      <div className="border-b border-[#333] pb-8 mb-8 text-white relative z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">{content.title}</h1>
      </div>
      {content.coverImage && (
        <div className="w-full aspect-[21/9] bg-[#111] border-2 border-[#333] relative flex items-center justify-center overflow-hidden mb-12">
          <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80" style={{ backgroundImage: `url(${content.coverImage})` }}></div>
        </div>
      )}
      <div className="max-w-2xl mx-auto mb-12">
        <p className="font-mono text-sm leading-relaxed text-[#888] whitespace-pre-line text-justify">
          {content.content}
        </p>
      </div>

      {content.showMarquee && (
        <div className="w-full bg-white text-black font-mono text-sm py-3 overflow-hidden whitespace-nowrap font-bold uppercase tracking-widest flex items-center rotate-[-1deg] scale-105 mb-12">
          <span className="inline-block animate-pulse">{content.marqueeText || '• RAW AUDIO • INDUSTRIAL VISUALS • HEAVYWEIGHT MERCH • NO COMPROMISE • BODEGA SESSIONS'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {squares.map((sq: any, i: number) => (
              <div key={i} className={`${sq.bgColor || 'bg-gray-950'} border border-[#333] p-6 text-white`}>
                  <h3 className="font-mono text-lg font-bold uppercase tracking-widest mb-4">{sq.title}</h3>
                  <p className="font-mono text-xs text-[#888]">{sq.desc}</p>
              </div>
          ))}
      </div>
    </div>
  )
}

export function PreviewSession({ content }: { content: any }) {
  return (
    <div className="w-full max-w-[1200px] mx-auto border border-[#333] bg-black shadow-2xl p-8 relative pointer-events-none">
      <div className="flex justify-between items-end border-b border-[#333] pb-8 mb-8 text-white relative z-10">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter" dangerouslySetInnerHTML={{ __html: (content.title || '').replace(' x ', ' x <br/>') }}></h1>
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
        {content.artists?.map((a: any, i: number) => (
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
  )
}

export function PreviewVip({ content }: { content: any }) {
  return (
    <div className="w-full max-w-[800px] mx-auto border border-[#333] bg-black shadow-2xl relative pointer-events-none text-white">
      
      {/* SECCIÓN 1: BIENVENIDA (Grid 50/50: FOTO - TEXTO) */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-square bg-[#111] border-r border-b border-[#333] relative flex items-center justify-center overflow-hidden">
          {content.welcomeImage ? (
            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80" style={{ backgroundImage: `url(${content.welcomeImage})` }}></div>
          ) : (
            <span className="font-mono text-xs text-[#555]">[IMAGEN DE BIENVENIDA]</span>
          )}
        </div>
        
        <div className="p-8 border-b border-[#333] flex flex-col justify-center text-center md:text-left">
          <span className="text-[10px] text-[#555] font-mono tracking-[0.3em] uppercase mb-4">TALLER ZERO EXCLUSIVO</span>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">{content.title || 'TÍTULO DEL EVENTO'}</h1>
          <p className="font-mono text-[#ffffff] uppercase tracking-widest text-xs font-bold border border-white px-3 py-1 inline-block self-center md:self-start mb-6">
            {content.dateText || 'FECHA DEL EVENTO'}
          </p>
          <p className="font-mono text-xs leading-relaxed text-[#ddd] whitespace-pre-line">
            {content.welcomeText || 'Párrafo de bienvenida y valores...'}
          </p>
        </div>
      </div>

      {/* SECCIÓN 2: INFORMACIÓN (Grid 50/50: TEXTOS - FOTO) */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 border-r border-[#333] flex flex-col justify-center order-2 md:order-1">
          <div className="space-y-8">
            <div className="border-l-2 border-[#333] pl-4">
              <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-2 uppercase">{"/// LOCACIÓN SECRETA"}</h3>
              <p className="font-mono text-xs leading-relaxed text-white uppercase tracking-wider">{content.location || 'UBICACIÓN'}</p>
            </div>
            
            <div className="border-l-2 border-[#333] pl-4">
              <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-2 uppercase">{"/// LINEUP"}</h3>
              <p className="font-mono text-xs leading-relaxed text-[#ddd] whitespace-pre-line uppercase font-bold">{content.lineup || 'LINEUP A REVELAR'}</p>
            </div>
            
            <div className="border-l-2 border-[#333] pl-4">
              <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-2 uppercase">{"/// REGLAS DE ACCESO"}</h3>
              <p className="font-mono text-[10px] leading-relaxed text-[#888] whitespace-pre-line">{content.rules || 'NORMAS DEL EVENTO'}</p>
            </div>
          </div>
        </div>

        <div className="aspect-square bg-[#111] border-b border-[#333] relative flex items-center justify-center overflow-hidden order-1 md:order-2">
          {content.infoImage ? (
            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80" style={{ backgroundImage: `url(${content.infoImage})` }}></div>
          ) : (
            <span className="font-mono text-xs text-[#555]">[IMAGEN SECUNDARIA]</span>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: DESPEDIDA (ANCHO COMPLETO) */}
      <div className="p-12 border-t border-[#333] text-center bg-[#050505]">
        <p className="font-mono text-sm leading-relaxed text-[#888] whitespace-pre-line max-w-lg mx-auto uppercase tracking-widest">
          {content.farewellText || 'TEXTO FINAL DE DESPEDIDA / NO FOTOS. NO FLASH.'}
        </p>
      </div>

    </div>
  )
}
