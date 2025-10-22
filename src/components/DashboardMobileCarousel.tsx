import { useEffect, useState, ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface DashboardMobileCarouselProps {
  sections: ReactNode[];
}

export function DashboardMobileCarousel({ sections }: DashboardMobileCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    axis: 'y', 
    loop: false,
    align: 'start',
    containScroll: false,
    dragFree: false,
    skipSnaps: false,
    watchDrag: true,
    watchResize: true,
    watchSlides: true,
    duration: 25
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    const onPointerDown = () => {
      setIsDragging(true);
    };

    const onPointerUp = () => {
      setIsDragging(false);
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
      emblaApi.off('pointerUp', onPointerUp);
    };
  }, [emblaApi]);

  return (
    <div className="relative h-[calc(100vh-12rem)]">
      <div 
        className={`overflow-hidden h-full touch-pan-y select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        ref={emblaRef}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="flex flex-col" style={{ height: '100%' }}>
          {sections.map((section, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-1 flex items-center justify-center"
              style={{ 
                height: 'calc(100vh - 12rem)',
                minHeight: 'calc(100vh - 12rem)',
                maxHeight: 'calc(100vh - 12rem)'
              }}
            >
              <div className="w-full h-full animate-fade-in pointer-events-auto">
                {section}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de página */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30'
            }`}
            aria-label={`Ir a sección ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
