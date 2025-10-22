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
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative h-[calc(100vh-12rem)]">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex flex-col">
          {sections.map((section, index) => (
            <div
              key={index}
              className="min-h-[calc(100vh-12rem)] flex-[0_0_auto] px-1 flex items-center justify-center"
            >
              <div className="w-full animate-fade-in">
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
