import { type EmblaOptionsType } from 'embla-carousel';
import Carousel from '../../components/Carousel';
import tutorialImg1 from '../../assets/tutorial/tutorial1.png';
import tutorialImg2 from '../../assets/tutorial/tutorial2.png';
import tutorialImg3 from '../../assets/tutorial/tutorial3.png';
import tutorialImg4 from '../../assets/tutorial/tutorial4.png';
import Modal from '../../components/Modal';

export const OPTIONS: EmblaOptionsType = { containScroll: false };
// const SLIDE_COUNT = 5;
// const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export const SLIDES = [
  {
    title: 'Move',
    text: 'Click an adjacent hex to move your character before the timer runs out.',
    img: tutorialImg1,
  },
  {
    title: 'Shoot',
    text: 'Click "Shoot" and select an adjacent hex to fire in that direction.',
    img: tutorialImg2,
  },
  {
    title: 'Cards',
    text: 'Collect a card by moving onto it to gain one-time immunity from shots.',
    img: tutorialImg3,
  },
  {
    title: 'Win',
    text: 'Collect 3 cards and go to the middle or just be the last one standing.',
    img: tutorialImg4,
  },
  {
    title: 'Collision',
    text: 'If both players move to the same hex, they bounce back to their previous positions, and the hex is marked as last known for both.',
    img: tutorialImg1,
  },
  {
    title: 'Zone',
    text: 'Every 8 moves, the grid shrinks. Players outside the zone die.',
    img: tutorialImg1,
  },
  {
    title: 'Visibility',
    text: 'Opponents are only visible at their last known position (when they shoot or collect a card).',
    img: tutorialImg1,
  },
  {
    title: 'Turn',
    text: 'Shots resolve after all players make a move (shoot or move).',
    img: tutorialImg1,
  },
];

const TutorialPage = () => {
  return (
    <Modal isOpen={true} setIsOpen={() => {}}>
      <Carousel slides={SLIDES} options={OPTIONS} />
    </Modal>
  );
};

export default TutorialPage;
