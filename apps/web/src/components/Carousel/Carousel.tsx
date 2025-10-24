import React from 'react';
import type { EmblaOptionsType } from 'embla-carousel';
// import { DotButton, useDotButton } from './EmblaCarouselDotButton';
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from './CarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import c from './style.module.css';

type Slide = {
  title: string;
  text: string;
  img: string;
};

type PropType = {
  slides: Slide[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  //   const { selectedIndex, scrollSnaps, onDotButtonClick } =
  //     useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section className={c.embla}>
      <div className={c.viewport} ref={emblaRef}>
        <div className={c.container}>
          {slides.map((s) => (
            <div className={c.slide} key={s.text}>
              {/* <div className={c.slideNumber}>{index + 1}</div> */}
              <div className={c.slideContentWrapper}>
                <h3 className={c.slideTitle}>{s.title}</h3>
                <img className={c.slideImage} src={s.img} alt={s.text} />
                <p className={c.slideText}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={c.controls}>
        <div className={c.buttons}>
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        {/* <div className={c.dots}>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : '',
              )}
            />
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default EmblaCarousel;
