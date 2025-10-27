import React from 'react';
import type { EmblaOptionsType } from 'embla-carousel';
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
          {slides.map((s, i) => (
            <div className={c.slide} key={s.text}>
              <div className={c.slideContentWrapper}>
                <div>
                  <h3 className={c.slideTitle}>{s.title}</h3>
                </div>
                <img className={c.slideImage} src={s.img} alt={s.text} />
                <p className={c.slideText}>{s.text}</p>
              </div>
              <div className={c.slideCount}>
                {i + 1} / {slides.length}
              </div>
            </div>
          ))}
        </div>
        {!prevBtnDisabled && (
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        )}
        {!nextBtnDisabled && (
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        )}{' '}
      </div>

      <div className={c.controls} style={{ display: 'none' }}>
        <div className={c.buttons}></div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
