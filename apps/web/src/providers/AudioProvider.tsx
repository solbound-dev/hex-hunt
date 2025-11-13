import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

// eslint-disable-next-line react-refresh/only-export-components
export enum SoundSource {
  NEW_TURN = '/audio/next-move.mp3',
  SCI_FI_GUN_SHOT = '/audio/sci-fi-gun-shot.mp3',
}

type AudioContextType = {
  setSound: (src: string | null) => void;
  setMove: (move: number) => void;
};

const initialContextValue: AudioContextType = {
  setSound: () => {},
  setMove: () => {},
};

const AudioContext = createContext<AudioContextType>(initialContextValue);

type Props = {
  children: React.ReactNode;
};

const AudioProvider: React.FC<Props> = ({ children }) => {
  const soundRef = useRef<Howl | null>(null);
  const [sound, setSound] = useState<string | null>(null);
  const [move, setMove] = useState<number>(0);

  const playNewSound = (src: string) => {
    const newSound = new Howl({
      src: [src],
      autoplay: true,
      loop: false,
      volume: 0.5,
      onload: () => console.log('sound loaded'),
      onplayerror: (id, error) => console.error('sound play error', id, error),
      onloaderror: (id, error) => console.error('sound load error', id, error),
    });

    console.log('newSound', newSound);

    newSound.play();
    soundRef.current = newSound;
  };

  useEffect(() => {
    if (soundRef.current) {
      const oldSound = soundRef.current;
      oldSound.stop();
      oldSound.unload();
    }

    if (sound) playNewSound(sound);
  }, [sound, move]);

  const value = {
    setSound,
    setMove,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export default AudioProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => useContext(AudioContext);
